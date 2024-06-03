import { useEffect, useState } from "react";
import axios from "axios";

function LinkContainer({ id }) {
  const [items, setItems] = useState([]);
  const fetchData = async () => {
    const res = await axios.get("http://localhost:3000/links/");
    setItems(res.data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e) => {
    const key = e.target.id;
    try {
      await axios.delete(`http://localhost:3000/links/${key}`);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const generateListItem = () => {
    if (items.length) {
      items.map((i) => {
        // First find/create the parent container:
        let container = document.getElementById(`${i.category}`);

        // To avoid multiple render.
        // Maybe there is a better solution?

        if (!document.getElementById(`${i._id}`)) {
          //create <li>, <a>, <i> and <button>
          const listItem = document.createElement("li");
          listItem.key = `${i._id}`;
          const link = document.createElement("a");
          link.href = `${i.link}`;
          link.target = "_blank";
          link.innerText = `${i.name}`;

          const button = document.createElement("button");
          button.className = "deleteButton";
          button.id = `${i._id}`;
          button.onclick = handleDelete;

          const xmark = document.createElement("i");
          xmark.className = "fa-solid fa-xmark";
          xmark.id = `${i._id}`;

          // chain the elements together:
          button.appendChild(xmark);
          listItem.appendChild(link);
          listItem.appendChild(button);
          container?.appendChild(listItem);
        }
      });
    }
  };
  generateListItem();

  return (
    <div className="list-container">
      <p>{id}</p>
      <ul className="list-group list-inner-container" id={id}></ul>
    </div>
  );
}

export default LinkContainer;
