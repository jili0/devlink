const addLink = async (linkData) => {
  // Validate that all required fields are present
  if (!linkData.title.trim() || !linkData.url.trim() || !linkData.category.trim()) {
    showNotification('Title, URL, and category are required', 'error');
    return;
  }

  if (isLoggedIn) {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      });

      if (!res.ok) {
        throw new Error('Failed to add link');
      }

      const newLink = await res.json();
      // Mark link as cloud saved
      const cloudLink = { ...newLink, isCloudSaved: true };
      setLinks(prevLinks => [...prevLinks, cloudLink]);
      showNotification('Link added to cloud successfully', 'success');
      return cloudLink; // Return the link for reference
    } catch (error) {
      console.error('Error adding link:', error);
      showNotification('Failed to add link to cloud', 'error');
      
      // Fallback to local storage if API fails
      const localLink = {
        _id: uuidv4(),
        ...linkData,
        createdAt: new Date().toISOString(),
        isCloudSaved: false,
      };
      setLinks(prevLinks => [...prevLinks, localLink]);
      showNotification('Link saved locally', 'info');
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
    setLinks(prevLinks => [...prevLinks, localLink]);
    showNotification('Link saved locally', 'success');
    return localLink;
  }
};