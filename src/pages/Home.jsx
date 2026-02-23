import { useOutletContext } from "react-router-dom";

function Home() {
  const { user } = useOutletContext();

  return (
    <div>
      <h1>Hello, {user?.name || "User"} 👋</h1>
      <h2>Welcome to Docspert Health Dashboard</h2>
    </div>
  );
}

export default Home;