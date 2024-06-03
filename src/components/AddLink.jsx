import { useState } from "react";
import axios from "axios";

const AddLink = () => {
  const [link, setLink] = useState({
    name: "",
    link: "",
    category: "others",
  });

  const handleInput = (e) => {
    e.persist();
    setLink({
      ...link,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: link.name || link.link,
      link: link.link,
      category: link.category,
    };
    try {
      const addLink = await axios.post("http://localhost:3000/links", data);
      console.log(addLink.data);
    } catch (error) {
      console.error(error);
    }
    window.location.reload();
  };

  return (
    <form className="addLink_form" onSubmit={handleSubmit}>
      <input
        aria-label="Add link name"
        type="text"
        name="name"
        value={link.name}
        className="addLink_input"
        placeholder="Name"
        onChange={handleInput}
      />

      <input
        aria-label="Add link address"
        type="text"
        name="link"
        value={link.link}
        className="addLink_input"
        placeholder="Link"
        onChange={handleInput}
        autoFocus
      />

      <select
        aria-label="Add link category"
        className="addLink_input"
        name="category"
        value={link.category}
        onChange={handleInput}
      >
        <option value="others">Category</option>
        <option value="work">Work</option>
        <option value="utilities">Utilities</option>
        <option value="design">Design</option>
        <option value="others">Others</option>
      </select>
      <button type="submit" className="addLink_button">
        Add Link
      </button>
    </form>
  );
};

export default AddLink;
