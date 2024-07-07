import AddLink from "./AddLink";

function Header() {
  return (
    <header>
      <div>
        <h1>DevLink</h1>
        <nav>
          <a href="">Notes</a>
          <a href="">About</a>
          <a href="">Contact</a>
        </nav>
      </div>

      <AddLink />
    </header>
  );
}

export default Header;
