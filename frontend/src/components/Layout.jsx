import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children, withSearch = false }) {
  const [search, setSearch] = useState("");

  const filteredChildren =
    typeof children === "function" ? children(search) : children;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar search={search} onSearch={withSearch ? setSearch : null} />
        <section className="content">{filteredChildren}</section>
      </main>
    </div>
  );
}
