const defaultItems = [
  { icon: "📋", label: "My Account", hash: "#account" },
  { icon: "📦", label: "My Orders", hash: "#track" },
  { icon: "🧑‍⚕️", label: "My Consultations", hash: "#consultations" },
];

const ProfileMenu = ({ username, showProfile, setShowProfile, onLogout }) => {
  const handleNavigate = (hash) => {
    setShowProfile(false);
    window.location.hash = hash;
  };

  return (
    <div className="dashboard-profile-wrapper">
      <button
        className="dashboard-icon"
        aria-label="Account"
        onClick={() => setShowProfile((prev) => !prev)}
      >
        👤
      </button>
      {showProfile && (
        <div className="dashboard-profile-menu">
          <div className="profile-menu-header">
            <span>{username || "Guest"}</span>
          </div>
          {defaultItems.map((item) => (
            <button
              key={item.hash}
              className="profile-menu-item"
              onClick={() => handleNavigate(item.hash)}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <hr className="profile-menu-divider" />
          <button className="profile-menu-item logout-item" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;