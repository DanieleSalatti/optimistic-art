import Footer from "./Footer";
import Header from "./Header";

const Layout: React.FC<any> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="h-full">{children}</div>
      <Footer />
    </div>
  );
};
export default Layout;
