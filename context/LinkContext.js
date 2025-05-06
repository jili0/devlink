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

  // Check authentication and load user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("auth");

        if (!token) {
          setIsLoggedIn(false);
          setUsername("");
          return;
        }

        const res = await fetch("/api/auth/verify");
        const data = await res.json();

        if (data.isLoggedIn) {
          setIsLoggedIn(true);

          // Try to get username from localStorage
          try {
            const userInfo = localStorage.getItem("devlink_user");
            if (userInfo) {
              const userData = JSON.parse(userInfo);
              setUsername(userData.username || "");
            } else if (data.user && data.user.username) {
              // If we have username from the API but not in localStorage, save it
              setUsername(data.user.username);
              localStorage.setItem(
                "devlink_user",
                JSON.stringify({
                  username: data.user.username,
                  id: data.user.id,
                })
              );
            }
          } catch (e) {
            console.error("Error loading user data:", e);
          }
        } else {
          setIsLoggedIn(false);
          setUsername("");
          // Clear auth cookie if server says we're not logged in
          Cookies.remove("auth");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        setUsername("");
      }
    };

    checkAuth();
  }, []);

  // Load links from localStorage and API when auth state changes
  useEffect(() => {
    const loadLinks = async () => {
      setIsLoading(true);

      // Load local links from localStorage
      const localLinks = JSON.parse(
        localStorage.getItem("devlink_local_links") || "[]"
      );

      try {
        // If logged in, load links from API
        if (isLoggedIn) {
          const res = await fetch("/api/links");
          const apiLinks = await res.json();

          // Mark API links as cloud links
          const cloudLinks = apiLinks.map((link) => ({
            ...link,
            isCloudSaved: true,
          }));

          // Merge cloud links with local links
          // (avoiding duplicates by checking _id)
          const localOnlyLinks = localLinks.filter(
            (localLink) =>
              !cloudLinks.some(
                (cloudLink) =>
                  cloudLink._id === localLink._id ||
                  (cloudLink.url === localLink.url &&
                    cloudLink.title === localLink.title)
              )
          );

          // Save cloud links to localStorage for offline use
          const mergedLinks = [...cloudLinks, ...localOnlyLinks];
          localStorage.setItem(
            "devlink_all_links",
            JSON.stringify(mergedLinks)
          );

          setLinks(mergedLinks);
        } else {
          // If not logged in, just use local links
          setLinks(localLinks);
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
        // If API fails, fall back to local links
        setLinks(localLinks);
        showNotification("Failed to load cloud links", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadLinks();
  }, [isLoggedIn]);

  // Save local links to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const localLinks = links.filter((link) => !link.isCloudSaved);
      localStorage.setItem("devlink_local_links", JSON.stringify(localLinks));
      localStorage.setItem("devlink_all_links", JSON.stringify(links));
    }
  }, [links, isLoading]);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addLink = async (linkData) => {
    // Validate that all required fields are present
    if (
      !linkData.title.trim() ||
      !linkData.url.trim() ||
      !linkData.category.trim()
    ) {
      showNotification("Title, URL, and category are required", "error");
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
        });

        if (!res.ok) {
          throw new Error("Failed to add link");
        }

        const newLink = await res.json();
        // Mark link as cloud saved
        const cloudLink = { ...newLink, isCloudSaved: true };
        setLinks((prevLinks) => [...prevLinks, cloudLink]);
        showNotification("Link added to cloud successfully", "success");
        return cloudLink; // Return the link for reference
      } catch (error) {
        console.error("Error adding link:", error);
        showNotification("Failed to add link to cloud", "error");

        // Fallback to local storage if API fails
        const localLink = {
          _id: uuidv4(),
          ...linkData,
          createdAt: new Date().toISOString(),
          isCloudSaved: false,
        };
        setLinks((prevLinks) => [...prevLinks, localLink]);
        showNotification("Link saved locally", "info");
        return localLink;
      }
    } else {
      // Add to local storage only
      const localLink = {
        _id: uuidv4(),
        ...linkData,
        createdAt: new Date().toISOString(),
        isCloudSaved: false,
      };
      setLinks((prevLinks) => [...prevLinks, localLink]);
      showNotification("Link saved locally", "success");
      return localLink;
    }
  };

  const updateLink = async (id, data) => {
    if (!id) {
      showNotification("Invalid link ID", "error");
      return;
    }

    const linkToUpdate = links.find((link) => link._id === id);

    if (!linkToUpdate) {
      showNotification("Link not found", "error");
      return;
    }

    if (linkToUpdate.isCloudSaved && !isLoggedIn) {
      showNotification("Please log in to edit cloud links", "error");
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
        });

        if (!res.ok) {
          throw new Error("Failed to update link");
        }

        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link._id === id ? { ...link, ...data } : link
          )
        );
        showNotification("Link updated successfully", "success");
      } catch (error) {
        console.error("Error updating link:", error);
        showNotification("Failed to update link", "error");
      }
    } else {
      // Update local link
      setLinks((prevLinks) =>
        prevLinks.map((link) => (link._id === id ? { ...link, ...data } : link))
      );
      showNotification("Local link updated successfully", "success");
    }
  };

  const deleteLink = async (id) => {
    if (!id) {
      showNotification("Invalid link ID", "error");
      return;
    }

    const linkToDelete = links.find((link) => link._id === id);

    if (!linkToDelete) {
      showNotification("Link not found", "error");
      return;
    }

    if (linkToDelete.isCloudSaved && !isLoggedIn) {
      showNotification("Please log in to delete cloud links", "error");
      return;
    }

    try {
      if (linkToDelete.isCloudSaved && isLoggedIn) {
        const res = await fetch(`/api/links/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to delete link");
        }
      }

      // Always update local state, even if API call fails
      setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));

      showNotification(
        linkToDelete.isCloudSaved
          ? "Link deleted successfully"
          : "Local link deleted successfully",
        "success"
      );
    } catch (error) {
      console.error("Error deleting link:", error);

      // For local links, still remove from state even if API fails
      if (!linkToDelete.isCloudSaved) {
        setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));
        showNotification("Local link deleted successfully", "success");
      } else {
        showNotification("Failed to delete link: " + error.message, "error");
      }
    }
  };

  const syncLocalLinks = async () => {
    if (!isLoggedIn) {
      showNotification("Please log in to sync links", "error");
      return;
    }

    const localLinks = links.filter((link) => !link.isCloudSaved);
    if (localLinks.length === 0) {
      showNotification("No local links to sync", "info");
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
        });

        if (!res.ok) {
          throw new Error("Failed to sync link");
        }

        const cloudLink = await res.json();
        successCount++;

        // Replace local link with cloud link
        setLinks((prevLinks) =>
          prevLinks.map((l) =>
            l._id === _id ? { ...cloudLink, isCloudSaved: true } : l
          )
        );
      } catch (error) {
        console.error("Error syncing link:", error);
        failCount++;
      }
    }

    setIsLoading(false);

    if (successCount > 0 && failCount > 0) {
      showNotification(
        `Synced ${successCount} links, ${failCount} failed`,
        "info"
      );
    } else if (successCount > 0) {
      showNotification(`Successfully synced ${successCount} links`, "success");
    } else if (failCount > 0) {
      showNotification(`Failed to sync ${failCount} links`, "error");
    }
  };

  // Handle logout
  const logout = () => {
    Cookies.remove("auth");
    setIsLoggedIn(false);
    setUsername("");
    showNotification(
      "Logged out successfully. Your links are still available on this device.",
      "info"
    );
  };

  return (
    <LinkContext.Provider
      value={{
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
      }}
    >
      {children}
    </LinkContext.Provider>
  );
}

export function useLinks() {
  return useContext(LinkContext);
}
