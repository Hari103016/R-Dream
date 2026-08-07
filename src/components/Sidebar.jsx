import { useState } from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";

import {
  LayoutDashboard,
  Users,
  MapPinned,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";


function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const location = useLocation();
  const navigate = useNavigate();


  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  async function logout() {

    const { error } = await supabase.auth.signOut();


    if(error){

      alert(error.message);
      return;

    }


    navigate("/", {
      replace:true,
    });

  }



  const menuItems = [

    {
      name:"Dashboard",
      icon:LayoutDashboard,
      path:"/dashboard",
    },


    {
      name:"Customers",
      icon:Users,
      path:"/customers",
    },


    {
      name:"Plots",
      icon:MapPinned,
      path:"/plots",
    },


    {
      name:"Bookings",
      icon:CalendarDays,
      path:"/bookings",
    },


    {
      name:"Payments",
      icon:CreditCard,
      path:"/payments",
    },


    {
      name:"Reports",
      icon:BarChart3,
      path:"/reports",
    },


    {
      name:"Admin Profile",
      icon:Users,
      path:"/admin-profile",
    },


    {
      name:"Settings",
      icon:Settings,
      path:"/settings",
    },


  ];



  return (

    <>


      {
        sidebarOpen && (

          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
          />

        )
      }



      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >



        <button
          className="close-btn"
          onClick={closeSidebar}
        >

          <X size={24}/>

        </button>




        {/* LOGO */}

        <div className="logo">

          <img
            src={logo}
            alt="Company Logo"
            className="company-logo"
          />

        </div>





        {/* MENU */}

        <nav>


          {
            menuItems.map((item)=>{


              const Icon = item.icon;


              return (

                <Link

                  key={item.path}

                  to={item.path}

                  className={
                    location.pathname === item.path
                    ? "active"
                    :""
                  }

                  onClick={closeSidebar}

                >


                  <Icon size={20}/>

                  <span>
                    {item.name}
                  </span>


                </Link>


              );


            })
          }


        </nav>






        {/* LOGOUT ONLY */}

        <div className="sidebar-bottom">


          <button

            className="logout"

            onClick={logout}

          >

            <LogOut size={18}/>

            Logout


          </button>



        </div>




      </aside>


    </>

  );

}


export default Sidebar;