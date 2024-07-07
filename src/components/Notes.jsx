import NoteContainer from "./NoteContainer";
import NoteNav from "./NoteNav"

function Notes() {
  return (
    <section className="notes">
      <NoteNav />
      <NoteContainer />
    </section>
  );
}

export default Notes;
