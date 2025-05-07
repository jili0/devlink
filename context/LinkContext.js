import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

const LinkContext = createContext();

export function LinkProvider({ children }) {
  const [links, setLinks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Überprüfe Authentifizierung beim Komponenten-Mount und bei Änderungen
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Direkte Cookie-Prüfung
        const token = Cookies.get("auth");
        
        // In Entwicklungsumgebung Debug-Logs anzeigen
        if (process.env.NODE_ENV === 'development') {
          console.log("LinkContext: Authentifizierungsprüfung gestartet");
          console.log("Cookie vorhanden:", !!token);
        }

        if (!token) {
          setIsLoggedIn(false);
          setUsername("");
          setAuthChecked(true);
          return;
        }

        // Serveranfrage mit explizitem credentials-Flag
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
          credentials: "include" // Wichtig für Cookie-Übertragung
        });
        
        if (!res.ok) {
          throw new Error("Verify API request failed: " + res.status);
        }
        
        const data = await res.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log("Verify API Antwort:", data);
        }

        if (data.isLoggedIn && data.user) {
          // Der Benutzer ist eingeloggt
          setIsLoggedIn(true);
          setUsername(data.user.username || "");
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Benutzer eingeloggt als:", data.user.username);
          }
        } else {
          // Der Benutzer ist nicht eingeloggt
          setIsLoggedIn(false);
          setUsername("");
          
          // Cookie entfernen, wenn der Server sagt, dass wir nicht eingeloggt sind
          Cookies.remove("auth", { path: '/' });
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Benutzer nicht eingeloggt, Auth-Cookie entfernt");
          }
        }
      } catch (error) {
        console.error("Authentifizierungsprüfung fehlgeschlagen:", error);
        setIsLoggedIn(false);
        setUsername("");
      } finally {
        setAuthChecked(true);
      }
    };

    // Sofortige Authentifizierungsprüfung durchführen
    checkAuth();
    
    // Event-Listener für Fensterfokus hinzufügen
    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);
    
    // Bei Komponenten-Unmount Event-Listener entfernen
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Lade Links basierend auf dem Authentifizierungsstatus
  useEffect(() => {
    // Nur ausführen, wenn die Authentifizierungsprüfung abgeschlossen ist
    if (!authChecked) return;
    
    const loadLinks = async () => {
      setIsLoading(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Links werden geladen, Auth-Status:", isLoggedIn);
      }

      // Lade lokale Links aus localStorage
      const localLinks = JSON.parse(
        localStorage.getItem("devlink_local_links") || "[]"
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Lokale Links geladen:", localLinks.length);
      }

      try {
        // Wenn eingeloggt, lade Links von der API
        if (isLoggedIn) {
          const res = await fetch("/api/links", {
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            },
            credentials: "include" // Wichtig für Cookie-Übertragung
          });
          
          if (!res.ok) {
            throw new Error("Fehler beim Abrufen der Links: " + res.status);
          }
          
          const apiLinks = await res.json();
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Cloud-Links geladen:", apiLinks.length);
          }

          // API-Links als Cloud-Links markieren
          const cloudLinks = apiLinks.map((link) => ({
            ...link,
            isCloudSaved: true,
          }));

          // Lokale Links auf Duplikate prüfen
          const localOnlyLinks = localLinks.filter(
            (localLink) =>
              !cloudLinks.some(
                (cloudLink) =>
                  cloudLink._id === localLink._id ||
                  (cloudLink.url === localLink.url &&
                    cloudLink.title === localLink.title)
              )
          );

          // Alle Links kombinieren
          const mergedLinks = [...cloudLinks, ...localOnlyLinks];
          setLinks(mergedLinks);
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Alle Links geladen:", mergedLinks.length);
          }
        } else {
          // Nicht eingeloggt, verwende nur lokale Links
          setLinks(localLinks);
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Nicht eingeloggt, nur lokale Links angezeigt");
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Links:", error);
        setLinks(localLinks);
        showNotification("Fehler beim Laden der Cloud-Links", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadLinks();
  }, [isLoggedIn, authChecked]);

  // Lokale Links in localStorage speichern
  useEffect(() => {
    if (!isLoading) {
      const localLinks = links.filter((link) => !link.isCloudSaved);
      localStorage.setItem("devlink_local_links", JSON.stringify(localLinks));
    }
  }, [links, isLoading]);

  // Benachrichtigungsfunktion
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Link hinzufügen
  const addLink = async (linkData) => {
    if (
      !linkData.title.trim() ||
      !linkData.url.trim() ||
      !linkData.category.trim()
    ) {
      showNotification("Titel, URL und Kategorie sind erforderlich", "error");
      return;
    }

    if (isLoggedIn) {
      try {
        const res = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(linkData),
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Fehler beim Hinzufügen des Links");
        }

        const newLink = await res.json();
        const cloudLink = { ...newLink, isCloudSaved: true };
        setLinks((prevLinks) => [...prevLinks, cloudLink]);
        showNotification("Link zur Cloud hinzugefügt", "success");
        return cloudLink;
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Links:", error);
        showNotification("Fehler beim Hinzufügen des Links zur Cloud", "error");

        // Fallback: lokales Speichern
        const localLink = {
          _id: uuidv4(),
          ...linkData,
          createdAt: new Date().toISOString(),
          isCloudSaved: false,
        };
        setLinks((prevLinks) => [...prevLinks, localLink]);
        showNotification("Link lokal gespeichert", "info");
        return localLink;
      }
    } else {
      // Nur lokal speichern
      const localLink = {
        _id: uuidv4(),
        ...linkData,
        createdAt: new Date().toISOString(),
        isCloudSaved: false,
      };
      setLinks((prevLinks) => [...prevLinks, localLink]);
      showNotification("Link lokal gespeichert", "success");
      return localLink;
    }
  };

  // Link aktualisieren
  const updateLink = async (id, data) => {
    if (!id) {
      showNotification("Ungültige Link-ID", "error");
      return;
    }

    const linkToUpdate = links.find((link) => link._id === id);

    if (!linkToUpdate) {
      showNotification("Link nicht gefunden", "error");
      return;
    }

    if (linkToUpdate.isCloudSaved && !isLoggedIn) {
      showNotification("Bitte anmelden, um Cloud-Links zu bearbeiten", "error");
      return;
    }

    if (linkToUpdate.isCloudSaved && isLoggedIn) {
      try {
        const res = await fetch(`/api/links/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Fehler beim Aktualisieren des Links");
        }

        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link._id === id ? { ...link, ...data, isCloudSaved: true } : link
          )
        );
        showNotification("Link erfolgreich aktualisiert", "success");
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Links:", error);
        showNotification("Fehler beim Aktualisieren des Links", "error");
      }
    } else {
      // Lokalen Link aktualisieren
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link._id === id ? { ...link, ...data } : link))
      );
      showNotification("Lokaler Link aktualisiert", "success");
    }
  };

  // Link löschen
  const deleteLink = async (id) => {
    if (!id) {
      showNotification("Ungültige Link-ID", "error");
      return;
    }

    const linkToDelete = links.find((link) => link._id === id);

    if (!linkToDelete) {
      showNotification("Link nicht gefunden", "error");
      return;
    }

    if (linkToDelete.isCloudSaved && !isLoggedIn) {
      showNotification("Bitte anmelden, um Cloud-Links zu löschen", "error");
      return;
    }

    try {
      if (linkToDelete.isCloudSaved && isLoggedIn) {
        const res = await fetch(`/api/links/${id}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Fehler beim Löschen des Links");
        }
      }

      setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));

      showNotification(
        linkToDelete.isCloudSaved
          ? "Link erfolgreich gelöscht"
          : "Lokaler Link erfolgreich gelöscht",
        "success"
      );
    } catch (error) {
      console.error("Fehler beim Löschen des Links:", error);

      if (!linkToDelete.isCloudSaved) {
        setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));
        showNotification("Lokaler Link erfolgreich gelöscht", "success");
      } else {
        showNotification("Fehler beim Löschen des Links: " + error.message, "error");
      }
    }
  };

  // Lokale Links mit der Cloud synchronisieren
  const syncLocalLinks = async () => {
    if (!isLoggedIn) {
      showNotification("Bitte anmelden, um Links zu synchronisieren", "error");
      return;
    }

    const localLinks = links.filter((link) => !link.isCloudSaved);
    if (localLinks.length === 0) {
      showNotification("Keine lokalen Links zum Synchronisieren", "info");
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const link of localLinks) {
      try {
        const { _id, isCloudSaved, ...linkData } = link;
        const res = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(linkData),
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Fehler beim Synchronisieren des Links");
        }

        const cloudLink = await res.json();
        successCount++;

        setLinks((prevLinks) =>
          prevLinks.map((l) =>
            l._id === _id ? { ...cloudLink, isCloudSaved: true } : l
          )
        );
      } catch (error) {
        console.error("Fehler beim Synchronisieren des Links:", error);
        failCount++;
      }
    }

    setIsLoading(false);

    if (successCount > 0 && failCount > 0) {
      showNotification(
        `${successCount} Links synchronisiert, ${failCount} fehlgeschlagen`,
        "info"
      );
    } else if (successCount > 0) {
      showNotification(`${successCount} Links erfolgreich synchronisiert`, "success");
    } else if (failCount > 0) {
      showNotification(`Fehler beim Synchronisieren von ${failCount} Links`, "error");
    }
  };

  // Abmelden
  const logout = () => {
    // Auth-Cookie entfernen
    Cookies.remove("auth", { path: '/' });
    
    // Auth-Status zurücksetzen
    setIsLoggedIn(false);
    setUsername("");
    
    // Nach dem Logout nur lokale Links anzeigen
    const localLinks = links.filter(link => !link.isCloudSaved);
    setLinks(localLinks);
    
    showNotification(
      "Erfolgreich abgemeldet. Deine Links sind weiterhin auf diesem Gerät verfügbar.",
      "info"
    );
  };

  // Context-Wert
  const contextValue = {
    links,
    isLoggedIn,
    setIsLoggedIn,
    notification,
    isLoading,
    username,
    addLink,
    updateLink,
    deleteLink,
    syncLocalLinks,
    showNotification,
    logout,
  };

  return (
    <LinkContext.Provider value={contextValue}>
      {children}
    </LinkContext.Provider>
  );
}

export function useLinks() {
  return useContext(LinkContext);
}