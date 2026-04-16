import { github, globe, twitter } from "../icons";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/lists");
  };

  const links = [
    { href: "http://github.com/darwinz/thnkfl", icon: github(10), label: "GitHub" },
    { href: "https://twitter.com/ubbjuntu", icon: twitter(10), label: "Twitter" },
    { href: "http://johnsonb.com", icon: globe(10), label: "Personal site" },
  ];

  return (
    <>
      <section className="container mx-auto flex">
        <div className="flex flex-col mx-auto justify-center p-6 text-center">
          <p className="my-8 text-xl md:text-2xl lg:text-3xl font-medium">
            Introducing
          </p>
          <h1 className="text-4xl md:text-7xl lg:text-9xl font-bold">
            Thnkflist
          </h1>
          <p className="my-8 text-xl md:text-2xl lg:text-3xl font-medium">
            Your running gratitude list.
          </p>
          <button
            onClick={handleClick}
            className="mx-auto mt-4 py-3 lg:py-5 px-10 lg:px-24 text-lg md:text-2xl font-semibold rounded-lg shadow-md bg-white text-gray-900 border border-gray-900 hover:border-transparent hover:text-white hover:bg-gray-900 focus:outline-none"
          >
            Get started
          </button>
        </div>
      </section>

      <section className="absolute bottom-0 right-0 py-3 px-6 mr-8 mb-8 flex">
        {links.map((item) => (
          <div
            key={item.href}
            className="rounded-full mx-4 transition duration-200 ease-in-out transform hover:-translate-y-3 hover:scale-125 hover:shadow-4xl"
          >
            <a href={item.href} aria-label={item.label}>
              {item.icon}
            </a>
          </div>
        ))}
      </section>
    </>
  );
};

export default Landing;
