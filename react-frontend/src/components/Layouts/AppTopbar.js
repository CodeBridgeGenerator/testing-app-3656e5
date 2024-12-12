import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import client from "../../services/restClient";
import Email from "../../assets/icons/Email.js";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import "./Notification.css";
import NotificationMenu from "./NotificationMenu.js";

const AppTopbar = (props) => {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const [ticker, setTicker] = useState("");
  const label = process.env.REACT_APP_PROJECT_LABEL;
  const [profiles, setProfiles] = useState([]);
  const [roleNames, setRoleNames] = useState({});
  const [userItems, setUserItems] = useState([]);
  const [selectedUser, setSelectedUser] = useState(
    localStorage.getItem("selectedUser") || null 
  );

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", selectedUser);
    }
  }, [selectedUser]);


  const initializeCacheStructure = async () => {
    try {
      if(!props.isLoggedIn) return;
      const response = await props.getCache();
      const currentCache = response.results;

      const profilesResponse = await client.service("profiles").find({
        query: {
          $limit: 10000,
          $populate: ["position"],
        },
      });
      const profilesData = profilesResponse.data;

      const defaultCacheStructure = {
        profiles: profilesData.map((profile) => ({
          profileId: profile._id,
          role: profile.position?.roleId || "Unknown Role",
          preferences: {
            dashboardCards: [],
            recent: [],
            favourites: [],
            settings: {},
          },
        })),
        selectedUser: selectedUser || profilesData[0]?._id, 
        activeKey: "",
      };

      if (!currentCache || !currentCache.profiles) {
        await props.setCache(defaultCacheStructure);
        console.log("Cache initialized with profile-specific preferences and selected user");
        localStorage.setItem("selectedUser", selectedUser);
      }
    } catch (error) {
      console.error("Error initializing cache structure:", error);
    }
  };

  useEffect(() => {
    initializeCacheStructure();
  }, []);

  // Handle user patched event only once
  useEffect(() => {
    const handlePatchedUser = (user) => {
      if (props.user._id === user?._id) {
        props.logout();
      }
      setTicker(`patched ${user.name}`);
    };

    client.service("users").on("patched", handlePatchedUser);

    return () => {
      client.service("users").off("patched", handlePatchedUser);
    };
  }, [props.user._id, props.logout]);

  const showMenu = (e) => {
    if (userMenuRef?.current) userMenuRef.current.show(e);
  };

  const fetchRoleNames = async (profiles) => {
    const uniqueRoleIds = [
      ...new Set(
        profiles.map((profile) => profile.position?.roleId).filter(Boolean),
      ),
    ];
    const rolePromises = uniqueRoleIds.map((roleId) =>
      client.service("roles").get(roleId),
    );

    try {
      const roles = await Promise.all(rolePromises);
      const roleMap = roles.reduce((acc, role) => {
        acc[role._id] = role.name;
        return acc;
      }, {});
      setRoleNames(roleMap);
    } catch (error) {
      console.error("Error fetching role names:", error);
    }
  };

  useEffect(() => {
    if(!props.isLoggedIn) return;
    const fetchProfiles = async () => {
      try {
        const res = await client.service("profiles").find({
          query: {
            $limit: 10000,
            $populate: [
              { path: "position", select: ["name", "roleId"] },
            ],
          },
        });
        setProfiles(res.data);
        fetchRoleNames(res.data);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    fetchProfiles();
  }, []);


  useEffect(() => {
    const formattedUserItems = profiles
      .filter((profile) => profile.userId === props.user._id) 
      .map((profile) => ({
        id: profile._id,
        name: profile.name || "Unknown",
        position: profile.position?.name || "Unknown Position",
        role: roleNames[profile.position?.roleId] || "Unknown Role",
        status: "success",
      }));
  
    setUserItems(formattedUserItems);
  
    if (!selectedUser && formattedUserItems[0]) {
      setSelectedUser(formattedUserItems[0].id);
    }
  }, [profiles, roleNames, props.user._id]);
  


  useEffect(() => {
    const updateSelectedUserInCache = async () => {
      try {
        if (selectedUser) {
          const response = await props.getCache();
          const currentCache = response.results;
          if (!currentCache || typeof currentCache !== "object") {
            console.error("Invalid cache structure.");
            return;
          }
      
          const updatedCache = { ...currentCache, selectedUser };
          if (updatedCache.results) {
            delete updatedCache.results;
          }
      
          await props.setCache(updatedCache);
          console.log("Cache updated successfully.");
        }
      } catch (error) {
        alert("There was an issue updating the cache. Please try again.");
      }
      
    };
  
    if (selectedUser) updateSelectedUserInCache();
  }, [selectedUser, props]);



  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    window.location.reload();
  };

  const items = [
    ...userItems.map((user) => ({
      label: (
        <div
          className="container flex flex-row ms-0"
          style={{ width: "350px" }}
        >
          <div className="ps-0">
            <Avatar
              label={user.name.charAt(0).toUpperCase()}
              className="mr-2"
              shape="circle"
              size="large"
              style={{
                borderRadius: "50%",
                backgroundColor: "#D30000",
                color: "#ffffff",
              }}
            />
          </div>
          <div className="container flex-grow">
            <div
              className="justify-start mb-2"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#2A4454",
                textAlign: "left",
                width: "12rem",
              }}
            >
              {user.name}
            </div>
            <div
              className="justify-start mb-2"
              style={{ fontSize: "11px", color: "gray", textAlign: "left" }}
            >
              {user.position}
            </div>
            <div className="flex justify-start align-items-end">
              <Tag value={user.role} severity={user.status} />
            </div>
          </div>
          <div className="container pe-10 mt-1">
            {/* <RadioButton
              inputId={`user_${user.id}`}
              name="userRadio"
              value={user.id}
              checked={selectedUser === user.id}
              onChange={(e) => handleUserChange(e.value)}
            /> */}
            <input
              type="radio"
              id={user.id}
              name="userRadio"
              value={user.id}
              checked={selectedUser === user.id}
              onChange={(e) => handleUserChange(e)}
            />

          </div>
        </div>
      ),
      command: () => {
        console.log(`Selected user object:`, user);
      },
    })),
    { separator: true },
    {
      label: "Profile",
      icon: "pi pi-user",
      command: (event) => {
        navigate("/account");
        event.originalEvent.stopPropagation();
      },
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
    },
    {
      label: "Help",
      icon: "pi pi-question-circle",
    },
    {
      label: "Log Out",
      icon: "pi pi-fw pi-sign-out",
      template: (item) => {
        return (
          <ul className="p-menu-list p-reset">
            <li className="p-menu-list p-reset" key={item.label}>
              <a className="p-menuitem-link" onClick={onLogout} role="menuitem">
                <span
                  className={"p-menuitem-icon pi pi-sign-out text-primary"}
                ></span>
                <span className={"p-menuitem-text text-primary"}>
                  {item.label}
                </span>
              </a>
            </li>
          </ul>
        );
      },
    },
  ];

  const onLogout = async (e) => {
    try {
      const latestLogin = await client
        .service("loginHistory")
        .find({
          query: {
            userId: props.user._id,
            $limit: 1,
            $sort: { loginTime: -1 },
          },
        });

      if (latestLogin.data.length > 0) {
        const latestRecordId = latestLogin.data[0]._id;

        await client.service("loginHistory").patch(latestRecordId, {
          logoutTime: new Date(),
        });
      }

      await props.logout();
      navigate("/", { replace: true });
      closeMenu(e);
    } catch (error) {
      console.error("Error updating logout time or logging out:", error);
    }
  };


  return props.isLoggedIn ? (
    <div className="layout-topbar">
      <Link to="/project">
        <div className="cursor-pointer min-w-max flex align-items-end">
          <img src={"./assets/logo/cb-logo.svg"} height={30} className="mb-1" />
          <h3
            className="text-red-500"
            style={{ fontFamily: "MarlinGeo", fontWeight: "bolder", margin: 0 }}
          >
            <i className="pi pi-menu" style={{ fontSize: "1.5rem" }}></i>{" "}
            {label !== "" ? label : "My App"}
          </h3>
        </div>
      </Link>
      {ticker}

      {props.showSideMenuButton ? (
        <button
          type="button"
          className="p-link layout-menu-button layout-topbar-button"
          onClick={props.onToggleMenuClick}
        >
          <i className="pi pi-bars" />
        </button>
      ) : null}

      <button
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={props.onMobileTopbarMenuClick}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul
        className={
          "layout-topbar-menu lg:flex origin-top" +
          (props.mobileTopbarMenuActive
            ? " layout-topbar-menu-mobile-active"
            : "")
        }
      >
        <Link to="/inbox">
          <Email />
        </Link>

        <NotificationMenu />

        {props.onSettings ? (
          <li>
            <button
              className="p-link layout-topbar-button"
              onClick={props.onSettings}
            >
              <i className="pi pi-cog" />
              <span>Settings</span>
            </button>
          </li>
        ) : null}
        {props.onAccount ? (
          <li>
            <button
              className="p-link layout-topbar-button"
              onClick={props.onAccount}
            >
              <i className="pi pi-user" />
              <span>Profile</span>
            </button>
          </li>
        ) : null}
      </ul>

      <Menu
        model={items}
        popup
        ref={userMenuRef}
        id="user-popup-menu"
        key={selectedUser}
        style={{ width: "310px" }}
      />
      {props.isLoggedIn ? (
        <Avatar
          label={
            props.user.name ? props.user.name.charAt(0).toUpperCase() : " "
          }
          className="mr-2 ml-2"
          shape="circle"
          onClick={showMenu}
          aria-controls="user-popup-menu"
          aria-haspopup
          style={{
            borderRadius: "50%",
            backgroundColor: "#D30000",
            color: "#ffffff",
          }}
        />
      ) : (
        <Button
          label="login"
          className="p-button-rounded"
          onClick={() => navigate("/login")}
        />
      )}
    </div>
  ) : null;
};

const mapState = (state) => {
  const { isLoggedIn, user } = state.auth;
  return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
  logout: () => dispatch.auth.logout(),
  getCache: () => dispatch.cache.get(),
  setCache: (data) => dispatch.cache.set(data),
});

export default connect(mapState, mapDispatch)(AppTopbar);
