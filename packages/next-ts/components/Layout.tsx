import Footer from "./Footer";
import Header from "./Header";

const Layout: React.FC<any> = ({ children }) => {
  return (
    <>
      <div className="">
        <Header />
        <div className="h-[screen] ">{children}</div>
        <Footer />
      </div>
    </>
  );
};
export default Layout;
