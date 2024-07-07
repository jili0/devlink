import { useEffect, useState } from "react";
import axios from "axios";

function NoteContainer() {
  const [notes, setNotes] = useState([]);
  const fetchData = async () => {
    const res = await axios.get("http://localhost:3000/notes");
    // const res = await axios.get("https://devlink-api-0n9z.onrender.com/notes/");
    setNotes(res.data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e) => {
    const key = e.target.id;
    try {
      await axios.delete(`http://localhost:3000/notes/${key}`);
      // await axios.delete(`https://devlink-api-0n9z.onrender.com/notes/${key}`);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const generateListItem = () => {
    if (notes.length) {
      notes.map((i) => {
        // First find/create the parent container:
        let container = document.getElementById("noteContainer");

        // To avoid multiple render.
        // Maybe there is a better solution?

        if (!document.getElementById(`${i._id}`)) {
          //create <li>, <a>, <i> and <button>
          const listItem = document.createElement("li");
          listItem.key = `${i._id}`;
          const note = document.createElement("p");
          note.innerText = `${i.content}`;
          note.className = "notes";
          note.classList += `${i.category}`;

          const button = document.createElement("button");
          button.className = "deleteButton";
          button.id = `${i._id}`;
          button.onclick = handleDelete;

          const xmark = document.createElement("i");
          xmark.className = "fa-solid fa-xmark";
          xmark.id = `${i._id}`;

          // chain the elements together:
          button.appendChild(xmark);
          listItem.appendChild(note);
          listItem.appendChild(button);
          container?.appendChild(listItem);
        }
      });
    }
  };
  generateListItem();

  return <ul className="notes_content" id="noteContainer"></ul>;
}

export default NoteContainer;
