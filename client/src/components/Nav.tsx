import { ChatAlt2Icon, ShareIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";

const links = [
  { href: "/", label: "Chat", icon: ChatAlt2Icon },
  { href: "/explore", label: "Explore", icon: ShareIcon },
];

const Nav: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <header className="py-6 border-b border-teal-100 bg-teal-50">
      <nav className="flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-black">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-teal-300 rounded-full">
                <img src="/logo.svg" className="w-6 h-6" />
              </div>
              <p>
                <span className="text-teal-700">Gyan</span>
                <span className="text-teal-500">Guru</span>
              </p>
            </a>
          </Link>
        </h1>
        <ul className="flex items-center">
          {links.map(({ href, label, icon: Icon }, index) => (
            <li key={href}>
              <Link href={href}>
                <a
                  className={`py-2 px-4 border-2 border-teal-500 uppercase tracking-wider font-bold flex items-center gap-2
                  transition duration-150 ease-in-out
                  ${
                    pathname === href
                      ? "bg-teal-500 text-white"
                      : "text-teal-500"
                  }
                  ${
                    index === 0
                      ? "rounded-l-lg"
                      : index === links.length - 1 && "rounded-r-lg"
                  }`}
                >
                  <Icon className="w-5" />
                  {label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Nav;
