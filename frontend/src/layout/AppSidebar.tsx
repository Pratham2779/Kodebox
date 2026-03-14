// // AppSidebar.tsx
// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router";

// import {
//   ChevronDownIcon,
//   GridIcon,
//   HorizontaLDots,
//   UserCircleIcon,
// } from "../icons";

// import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
// import { VscTerminalBash } from "react-icons/vsc";
// import { MdOutlineBackup } from "react-icons/md";
// import { LuCircleDollarSign } from "react-icons/lu";

// type NavItem = {
//   name: string;
//   icon: React.ReactNode;
//   path?: string;
//   subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
// };

// const navItems: NavItem[] = [
//   { icon: <GridIcon />, name: "Dashboard", path: "/" },
//   { icon: <UserCircleIcon />, name: "Profile & Settings", path: "/profile" },
//   { name: "Terminal", icon: <VscTerminalBash />, path: "/terminal" },
//   { name: "Manage Backups", icon: <MdOutlineBackup />, path: "/manage-backups" },
//   { name: "Upgrade Plan", icon: <LuCircleDollarSign />, path: "/upgrade-plan" },
// ];

// const AppSidebar: React.FC = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();

//   const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
//   const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
//   const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const isActive = useCallback(
//     (path: string) => location.pathname === path,
//     [location.pathname]
//   );


//   useEffect(() => {
//     let matchedIndex: number | null = null;

//     navItems.forEach((nav, index) => {
//       nav.subItems?.forEach((sub) => {
//         if (isActive(sub.path)) matchedIndex = index;
//       });
//     });

//     setOpenSubmenu(matchedIndex);
//   }, [location.pathname, isActive]);


//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `main-${openSubmenu}`;
//       const el = subMenuRefs.current[key];
//       if (el) {
//         setSubMenuHeight((prev) => ({
//           ...prev,
//           [key]: el.scrollHeight ?? 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (index: number) => {
//     setOpenSubmenu((prev) => (prev === index ? null : index));
//   };

//   const renderMenuItems = (items: NavItem[]) => (
//     <ul className="flex flex-col gap-4">
//       {items.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index)}
//               className={`menu-item group ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
//                 } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
//                 }`}
//             >
//               <span className="menu-item-icon-size">{nav.icon}</span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <>
//                   <span className="menu-item-text">{nav.name}</span>
//                   <ChevronDownIcon
//                     className={`ml-auto h-5 w-5 transition-transform ${openSubmenu === index ? "rotate-180" : ""
//                       }`}
//                   />
//                 </>
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                   }`}
//               >
//                 <span className="menu-item-icon-size">{nav.icon}</span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <span className="menu-item-text">{nav.name}</span>
//                 )}
//               </Link>
//             )
//           )}

//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`main-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu === index
//                     ? `${subMenuHeight[`main-${index}`] ?? 0}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 ml-9 space-y-1">
//                 {nav.subItems.map((sub) => (
//                   <li key={sub.name}>
//                     <Link
//                       to={sub.path}
//                       className={`menu-dropdown-item ${isActive(sub.path)
//                         ? "menu-dropdown-item-active"
//                         : "menu-dropdown-item-inactive"
//                         }`}
//                     >
//                       {sub.name}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900
//         ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >

//       <div className={`py-8 ${!isExpanded && !isHovered ? "lg:text-center" : ""}`}>
//         <Link to="/">
//           {isExpanded || isHovered || isMobileOpen ? (
//             <>
//               <img
//                 src="/images/logo/logo.svg"
//                 alt="TailAdmin"
//                 width={150}
//                 className="dark:hidden"
//               />
//               <img
//                 src="/images/logo/logo-dark.svg"
//                 alt="TailAdmin"
//                 width={150}
//                 className="hidden dark:block"
//               />
//             </>
//           ) : (
//             <img src="/images/logo/logo-icon.svg" alt="TailAdmin" width={32} />
//           )}
//         </Link>
//       </div>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar">
//         <h2 className="mb-4 text-xs uppercase text-gray-400">
//           {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
//         </h2>
//         {renderMenuItems(navItems)}
//       </nav>

//       {/* Purchase Plan Widget */}
//       {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
//     </aside>
//   );
// };

// export default AppSidebar;





import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
} from "../icons";

import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { VscTerminalBash } from "react-icons/vsc";
import { MdOutlineBackup } from "react-icons/md";
import { LuCircleDollarSign } from "react-icons/lu";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // Updated path to /dashboard
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <UserCircleIcon />, name: "Profile & Settings", path: "/dashboard/profile" },
  { name: "Terminal", icon: <VscTerminalBash />, path: "/dashboard/terminal" },
  { name: "Manage Backups", icon: <MdOutlineBackup />, path: "/dashboard/manage-backups" },
  { name: "Upgrade Plan", icon: <LuCircleDollarSign />, path: "/dashboard/upgrade-plan" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let matchedIndex: number | null = null;

    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((sub) => {
        if (isActive(sub.path)) matchedIndex = index;
      });
    });

    setOpenSubmenu(matchedIndex);
  }, [location.pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu}`;
      const el = subMenuRefs.current[key];
      if (el) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: el.scrollHeight ?? 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="menu-item-text">{nav.name}</span>
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform ${
                      openSubmenu === index ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu === index
                    ? `${subMenuHeight[`main-${index}`] ?? 0}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={sub.path}
                      className={`menu-dropdown-item ${
                        isActive(sub.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900
        ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 ${!isExpanded && !isHovered ? "lg:text-center" : ""}`}>
        {/* Updated link target to /dashboard */}
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                src="/images/logo/logo.svg"
                alt="Kodebox"
                width={150}
                className="dark:hidden"
              />
              <img
                src="/images/logo/logo-dark.svg"
                alt="Kodebox"
                width={150}
                className="hidden dark:block"
              />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Kodebox" width={32} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto no-scrollbar">
        <h2 className="mb-4 text-xs uppercase text-gray-400">
          {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
        </h2>
        {renderMenuItems(navItems)}
      </nav>

      {/* Purchase Plan Widget */}
      {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
    </aside>
  );
};

export default AppSidebar;