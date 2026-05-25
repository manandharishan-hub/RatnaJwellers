import { useEffect, useState, useRef } from "react";
import {
  apiGet,
  getActiveApiBase,
  openDynamicJoinUrl,
  resolveMediaUrl,
} from "../services/api";
import ConnectionStatus from "../components/ConnectionStatus";
import {
  productsAPI,
  usersAPI,
  ordersAPI,
  settingsAPI,
} from "../services/adminApi";
import { consultationAPI } from "../services/consultationApi";
import { products as initialProducts } from "../data/products";
import Footer from "../components/Footer";
import "./admin.css";

const Icon = ({ children, size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NavIcon = ({ type }) => {
  if (type === "dashboard") {
    return (
      <Icon>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="4" />
        <rect x="14" y="10" width="7" height="11" />
        <rect x="3" y="14" width="7" height="7" />
      </Icon>
    );
  }
  if (type === "users") {
    return (
      <Icon>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
        <circle cx="17" cy="10" r="2" />
        <path d="M15 20c.2-1.8 1.4-3.2 3-4" />
      </Icon>
    );
  }
  if (type === "products") {
    return (
      <Icon>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </Icon>
    );
  }
  if (type === "orders") {
    return (
      <Icon>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M3 4h2l2 11h12l2-8H6" />
      </Icon>
    );
  }
  if (type === "consultations") {
    return (
      <Icon>
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <circle cx="12" cy="12" r="9" />
      </Icon>
    );
  }
  return (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </Icon>
  );
};

const AdminPanel = () => {
  // Mock users data
  const mockUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-0101",
      role: "Customer",
      status: "Active",
      created_at: "2025-12-15T10:00:00Z",
    },
    {
      id: 2,
      name: "Emma Davis",
      email: "emma@example.com",
      phone: "555-0102",
      role: "Customer",
      status: "Active",
      created_at: "2025-12-20T14:30:00Z",
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa@example.com",
      phone: "555-0103",
      role: "Customer",
      status: "Active",
      created_at: "2025-12-18T09:15:00Z",
    },
    {
      id: 4,
      name: "Maria Garcia",
      email: "maria@example.com",
      phone: "555-0104",
      role: "Admin",
      status: "Active",
      created_at: "2025-11-10T11:45:00Z",
    },
    {
      id: 5,
      name: "Nina Patel",
      email: "nina@example.com",
      phone: "555-0105",
      role: "Customer",
      status: "Inactive",
      created_at: "2025-12-22T16:20:00Z",
    },
  ];

  // Mock orders for Phase 2
  const initialOrders = [
    {
      id: "BEIGE-4812",
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      items: [{ product: "Hydrating Cream", qty: 2, price: 45.0 }],
      total: 125.0,
      status: "Shipped",
      date: "2026-02-13",
      address: "123 Main St, New York, NY",
    },
    {
      id: "BEIGE-4811",
      customer: "Emma Davis",
      email: "emma@example.com",
      items: [{ product: "Face Wash", qty: 1, price: 25.0 }],
      total: 89.99,
      status: "Processing",
      date: "2026-02-12",
      address: "456 Oak Ave, Los Angeles, CA",
    },
    {
      id: "BEIGE-4810",
      customer: "Lisa Chen",
      email: "lisa@example.com",
      items: [
        { product: "Serum", qty: 1, price: 55.0 },
        { product: "Moisturizer", qty: 1, price: 45.0 },
      ],
      total: 156.5,
      status: "Delivered",
      date: "2026-02-10",
      address: "789 Pine Rd, Chicago, IL",
    },
    {
      id: "BEIGE-4809",
      customer: "Maria Garcia",
      email: "maria@example.com",
      items: [{ product: "Lip Balm", qty: 3, price: 18.0 }],
      total: 72.5,
      status: "Shipped",
      date: "2026-02-09",
      address: "321 Elm St, Houston, TX",
    },
    {
      id: "BEIGE-4808",
      customer: "Nina Patel",
      email: "nina@example.com",
      items: [{ product: "Night Cream", qty: 1, price: 65.0 }],
      total: 210.0,
      status: "Processing",
      date: "2026-02-08",
      address: "654 Maple Ln, Phoenix, AZ",
    },
  ];

  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(
    initialOrders.map((order) => ({
      ...order,
      total: parseFloat(order.total) || 0,
      subtotal: parseFloat(order.subtotal) || 0,
      tax: parseFloat(order.tax) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
    })),
  );
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    tone: "",
    category: "",
    images: [],
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Customer",
    status: "Active",
  });

  // Settings state
  const [storeSettings, setStoreSettings] = useState({
    storeName: "BEIGE",
    storeEmail: "info@beige.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Fashion Street, New York, NY 10001",
    currency: "NPR",
    taxRate: "8.5",
    shippingCost: "10.00",
    freeShippingThreshold: "100.00",
    maintenanceMode: false,
    aboutUs: "Welcome to BEIGE - Your destination for premium beauty products.",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Consultation state
  const [consultations, setConsultations] = useState([]);
  const [consultationSubTab, setConsultationSubTab] = useState("appointments");
  const [consultationStatusFilter, setConsultationStatusFilter] = useState("");
  const [consultationNotesMap, setConsultationNotesMap] = useState({});
  const [consultationScheduleMap, setConsultationScheduleMap] = useState({});
  const [consultationServices, setConsultationServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "30",
    is_active: true,
  });
  const [consultationExperts, setConsultationExperts] = useState([]);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [expertFormData, setExpertFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    bio: "",
    years_of_experience: "",
    profile_picture: "",
    is_active: true,
  });
  const [expertDateList, setExpertDateList] = useState([]);
  const [expertDateLoading, setExpertDateLoading] = useState(false);
  const [editingExpertDate, setEditingExpertDate] = useState(null);
  const [expertDateForm, setExpertDateForm] = useState({
    date: "",
    start_time: "09:00",
    end_time: "17:00",
    is_active: true,
  });

  useEffect(() => {
    if (!showExpertModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeExpertModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showExpertModal]);

  // Loading and error states
  const [loading, setLoading] = useState({
    products: false,
    users: false,
    orders: false,
    settings: false,
  });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Ref to track actual File objects separately from state
  const fileMapRef = useRef(new Map());

  // Helper to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Helper to normalize user data with defaults
  const normalizeUsers = (userList) => {
    return userList.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "Customer",
      status: user.status || "Active",
      created_at: user.created_at || new Date().toISOString(),
    }));
  };

  // Helper to normalize product data with proper type conversion
  const normalizeProducts = (productList) => {
    return productList.map((product) => ({
      id: product.id,
      name: product.name || "Unknown",
      description: product.description || "",
      price: parseFloat(product.price) || 0,
      tone: product.tone || "",
      category: product.category || "General",
      images: Array.isArray(product.images)
        ? product.images
        : typeof product.images === "string"
          ? JSON.parse(product.images || "[]")
          : [],
      stock: parseInt(product.stock) || 0,
      created_at: product.created_at || new Date().toISOString(),
    }));
  };

  // Helper to normalize order data with proper type conversion
  const normalizeOrders = (orderList) => {
    return orderList.map((order) => ({
      id: order.id,
      order_number: order.order_number || `#${order.id}`,
      customer_name: order.customer_name || order.customer || "Unknown",
      customer_email: order.customer_email || order.email || "",
      customer_phone: order.customer_phone || order.phone || "",
      shipping_address: order.shipping_address || order.address || "",
      subtotal: parseFloat(order.subtotal) || 0,
      tax: parseFloat(order.tax) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
      total: parseFloat(order.total) || 0,
      status: order.status || "Pending",
      payment_status: order.payment_status || "Pending",
      items: Array.isArray(order.items) ? order.items : [],
      created_at: order.created_at || new Date().toISOString(),
      date: order.date || new Date().toISOString().split("T")[0],
    }));
  };

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Load summary
        apiGet("/admin/summary")
          .then((result) => setSummary(result))
          .catch((err) => console.error("Summary error:", err));

        // Load products
        setLoading((prev) => ({ ...prev, products: true }));
        try {
          const productsData = await productsAPI.list();
          setProducts(normalizeProducts(productsData.products || []));
        } catch (err) {
          console.error("Products error:", err);
          setProducts(normalizeProducts(initialProducts));
        } finally {
          setLoading((prev) => ({ ...prev, products: false }));
        }

        // Load users
        setLoading((prev) => ({ ...prev, users: true }));
        try {
          const usersData = await usersAPI.list();
          setUsers(normalizeUsers(usersData.users || mockUsers));
        } catch (err) {
          console.error("Users error:", err);
          setUsers(normalizeUsers(mockUsers));
        } finally {
          setLoading((prev) => ({ ...prev, users: false }));
        }

        // Load orders
        setLoading((prev) => ({ ...prev, orders: true }));
        try {
          const ordersData = await ordersAPI.list("All");
          setOrders(normalizeOrders(ordersData.orders || initialOrders));
        } catch (err) {
          console.error("Orders error:", err);
          setOrders(normalizeOrders(initialOrders));
        } finally {
          setLoading((prev) => ({ ...prev, orders: false }));
        }

        // Load settings
        setLoading((prev) => ({ ...prev, settings: true }));
        try {
          const settingsData = await settingsAPI.get();
          if (
            settingsData.settings &&
            Object.keys(settingsData.settings).length > 0
          ) {
            setStoreSettings((prev) => ({
              ...prev,
              ...settingsData.settings,
            }));
          }
        } catch (err) {
          console.error("Settings error:", err);
        } finally {
          setLoading((prev) => ({ ...prev, settings: false }));
        }
      } catch (err) {
        setError("Failed to load admin data");
      }
    };

    loadAdminData();
  }, []);

  // Load consultation data when that tab becomes active
  useEffect(() => {
    if (activeTab === "consultations") {
      if (consultationSubTab === "appointments")
        loadConsultations(consultationStatusFilter);
      if (consultationSubTab === "services") loadConsultationServices();
      if (consultationSubTab === "experts") loadConsultationExperts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expires");
    localStorage.removeItem("auth_user");
    window.location.hash = "#";
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    fileMapRef.current.clear();
    setFormData({
      name: "",
      description: "",
      price: "",
      tone: "",
      category: "",
      images: [],
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    fileMapRef.current.clear(); // Clear any previous files

    // Convert API images format to form format for editing
    const imagesForEdit = (product.images || []).map((img, idx) => ({
      id: img.id || Math.random().toString(36).substr(2, 9),
      src: img.src || img, // Handle both object and string formats
      name: img.name || `image-${idx}`,
    }));

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      tone: product.tone,
      category: product.category || "",
      images: imagesForEdit,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      setError("Please fill in all required fields");
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Price must be a valid positive number");
      return;
    }

    try {
      // Create FormData to support file uploads
      const uploadFormData = new FormData();
      uploadFormData.append("name", formData.name);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("price", priceValue);
      uploadFormData.append("tone", formData.tone);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("stock", formData.stock || 0);

      // Add actual image files and track images to keep
      const imagesToKeep = [];
      let filesCount = 0;

      formData.images.forEach((img) => {
        // Check if we have the actual File object stored in ref
        const file = fileMapRef.current.get(img.id);
        if (file && file instanceof File) {
          uploadFormData.append("images[]", file);
          filesCount++;
        } else if (img.src && typeof img.src === "string") {
          // If it's an existing image from database (has src starting with /storage/)
          if (img.src.startsWith("/storage/")) {
            imagesToKeep.push({
              src: img.src,
              name: img.name,
            });
          }
        }
      });

      // Add existing images to keep to FormData as JSON
      if (imagesToKeep.length > 0) {
        uploadFormData.append("keep_images", JSON.stringify(imagesToKeep));
      }

      console.log(
        `Sending product with ${filesCount} new files and ${imagesToKeep.length} existing images`,
        {
          name: formData.name,
          price: priceValue,
          category: formData.category,
          newFilesCount: filesCount,
          keepImagesCount: imagesToKeep.length,
        },
      );

      if (editingProduct) {
        // Update existing product
        setLoadingMessage("Updating product...");
        await productsAPI.updateWithFiles(editingProduct.id, uploadFormData);
        // Reload products list
        const productsData = await productsAPI.list();
        setProducts(normalizeProducts(productsData.products || []));
        showSuccess("Product updated successfully! ✓");
      } else {
        // Add new product
        setLoadingMessage("Creating product...");
        await productsAPI.createWithFiles(uploadFormData);
        // Reload products list
        const productsData = await productsAPI.list();
        setProducts(normalizeProducts(productsData.products || []));
        showSuccess("Product created successfully! ✓");
      }

      setShowProductModal(false);
      fileMapRef.current.clear();
      setFormData({
        name: "",
        description: "",
        price: "",
        tone: "",
        category: "",
        images: [],
      });
      setLoadingMessage("");
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Error saving product: " + (err.message || "Unknown error"));
      setLoadingMessage("");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        setLoadingMessage("Deleting product...");
        await productsAPI.delete(id);
        // Reload products list
        const productsData = await productsAPI.list();
        setProducts(normalizeProducts(productsData.products || []));
        setLoadingMessage("");
        showSuccess("Product deleted successfully! ✓");
      } catch (err) {
        setLoadingMessage("");
        setError("Error deleting product: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleCancelModal = () => {
    setShowProductModal(false);
    fileMapRef.current.clear();
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      tone: "",
      category: "",
      images: [],
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      // Read file as data URL for preview display
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageId = Math.random().toString(36).substr(2, 9);

        // Store actual File object in ref (not in state)
        fileMapRef.current.set(imageId, file);

        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              id: imageId,
              src: event.target.result, // Data URL for preview only
              name: file.name,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
    // Clear the input
    e.target.value = "";
  };

  const handleRemoveImage = (imageId) => {
    // Clean up file from ref if it exists
    fileMapRef.current.delete(imageId);

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  // Orders handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoadingMessage("Updating order status...");
      await ordersAPI.updateStatus(orderId, newStatus);
      // Reload orders
      const ordersData = await ordersAPI.list("All");
      setOrders(normalizeOrders(ordersData.orders || initialOrders));
      setLoadingMessage("");
      showSuccess("Order status updated successfully! ✓");
    } catch (err) {
      setLoadingMessage("");
      setError("Error updating order: " + (err.message || "Unknown error"));
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleDownloadOrdersReport = async (format) => {
    try {
      const base = await getActiveApiBase();
      const params = new URLSearchParams();
      params.set("format", format);
      params.set("status", statusFilter || "All");
      const url = `${base}/admin/orders/report?${params.toString()}`;
      window.open(url, "_blank");
      showSuccess(`Downloading ${format.toUpperCase()} report...`);
    } catch (err) {
      setError(err.message || "Failed to download report.");
    }
  };

  // User handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: "",
      email: "",
      phone: "",
      role: "Customer",
      status: "Active",
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status || "Active",
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.email) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (editingUser) {
        // Edit existing user
        setLoadingMessage("Updating user...");
        await usersAPI.update(editingUser.id, userFormData);
        // Reload users list
        const usersData = await usersAPI.list();
        setUsers(normalizeUsers(usersData.users || mockUsers));
        showSuccess("User updated successfully! ✓");
      } else {
        // Add new user
        setLoadingMessage("Creating user...");
        await usersAPI.create(userFormData);
        // Reload users list
        const usersData = await usersAPI.list();
        setUsers(normalizeUsers(usersData.users || mockUsers));
        showSuccess("User created successfully! ✓");
      }

      setShowUserModal(false);
      setUserFormData({
        name: "",
        email: "",
        phone: "",
        role: "Customer",
        status: "Active",
      });
      setLoadingMessage("");
    } catch (err) {
      setLoadingMessage("");
      setError("Error saving user: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        setLoadingMessage("Deleting user...");
        await usersAPI.delete(id);
        // Reload users list
        const usersData = await usersAPI.list();
        setUsers(normalizeUsers(usersData.users || mockUsers));
        setLoadingMessage("");
        showSuccess("User deleted successfully! ✓");
      } catch (err) {
        setLoadingMessage("");
        setError("Error deleting user: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleCancelUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserFormData({
      name: "",
      email: "",
      phone: "",
      role: "Customer",
      status: "Active",
    });
  };

  // ─── Consultation handlers ─────────────────────────────────────────────────

  const loadConsultations = async (status) => {
    try {
      const response = await consultationAPI.adminList(status || undefined);
      const appointments = response.appointments || [];
      setConsultations(appointments);
      setConsultationScheduleMap((prev) => {
        const next = { ...prev };
        appointments.forEach((appt) => {
          if (!next[appt.id]) {
            next[appt.id] = {
              appointment_date: appt.appointment_date || "",
              appointment_time: appt.appointment_time || "",
            };
          }
        });
        return next;
      });
    } catch (err) {
      setError("Failed to load consultations: " + (err.message || ""));
    }
  };

  const loadConsultationServices = async () => {
    try {
      const response = await consultationAPI.adminServices();
      setConsultationServices(response.services || []);
    } catch (err) {
      setError("Failed to load consultation services: " + (err.message || ""));
    }
  };

  const loadConsultationExperts = async () => {
    try {
      const response = await consultationAPI.adminExperts();
      setConsultationExperts(response.experts || []);
    } catch (err) {
      setError("Failed to load experts: " + (err.message || ""));
    }
  };

  const resetExpertDateForm = () => {
    setEditingExpertDate(null);
    setExpertDateForm({
      date: "",
      start_time: "09:00",
      end_time: "17:00",
      is_active: true,
    });
  };

  const loadExpertDates = async (expertId) => {
    if (!expertId) return;
    try {
      setExpertDateLoading(true);
      const response = await consultationAPI.adminExpertDates(expertId);
      setExpertDateList(response.expert_dates || []);
    } catch (err) {
      setError("Failed to load expert dates: " + (err.message || ""));
      setExpertDateList([]);
    } finally {
      setExpertDateLoading(false);
    }
  };

  const handleConsultationTabChange = (tab) => {
    setConsultationSubTab(tab);
    if (tab === "appointments") loadConsultations(consultationStatusFilter);
    if (tab === "services") loadConsultationServices();
    if (tab === "experts") loadConsultationExperts();
  };

  const handleMarkConsultationComplete = async (id) => {
    try {
      await consultationAPI.markComplete(id);
      showSuccess("Session marked complete.");
      await loadConsultations(consultationStatusFilter);
    } catch (err) {
      setError(err.message || "Failed to update.");
    }
  };

  const handleSaveConsultationNotes = async (id) => {
    try {
      await consultationAPI.addNotes(id, consultationNotesMap[id] || "");
      showSuccess("Notes saved.");
      await loadConsultations(consultationStatusFilter);
    } catch (err) {
      setError(err.message || "Failed to save notes.");
    }
  };

  const handleAssignConsultationSlot = async (id) => {
    const schedule = consultationScheduleMap[id];
    if (!schedule?.appointment_date || !schedule?.appointment_time) {
      setError(
        "Please provide both appointment date and time before assigning.",
      );
      return;
    }

    try {
      await consultationAPI.assignSlot(id, {
        appointment_date: schedule.appointment_date,
        appointment_time: schedule.appointment_time,
      });
      showSuccess("Date & slot assigned successfully.");
      await loadConsultations(consultationStatusFilter);
    } catch (err) {
      setError(err.message || "Failed to assign date and slot.");
    }
  };

  // Service modal helpers
  const handleAddService = () => {
    setEditingService(null);
    setServiceFormData({
      name: "",
      description: "",
      price: "",
      duration_minutes: "30",
      is_active: true,
    });
    setShowServiceModal(true);
  };

  const handleEditService = (svc) => {
    setEditingService(svc);
    setServiceFormData({
      name: svc.name,
      description: svc.description || "",
      price: String(svc.price),
      duration_minutes: String(svc.duration_minutes),
      is_active: svc.is_active,
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!serviceFormData.name || !serviceFormData.price) {
      setError("Service name and price are required.");
      return;
    }
    try {
      setLoadingMessage("Saving service...");
      const payload = {
        name: serviceFormData.name,
        description: serviceFormData.description,
        price: parseFloat(serviceFormData.price),
        duration_minutes: parseInt(serviceFormData.duration_minutes) || 30,
        is_active: serviceFormData.is_active,
      };
      if (editingService) {
        await consultationAPI.adminUpdateService(editingService.id, payload);
        showSuccess("Service updated! ✓");
      } else {
        await consultationAPI.adminCreateService(payload);
        showSuccess("Service created! ✓");
      }
      setShowServiceModal(false);
      await loadConsultationServices();
    } catch (err) {
      setError(err.message || "Failed to save service.");
    } finally {
      setLoadingMessage("");
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      setLoadingMessage("Deleting...");
      await consultationAPI.adminDeleteService(id);
      showSuccess("Service deleted.");
      await loadConsultationServices();
    } catch (err) {
      setError(err.message || "Failed to delete service.");
    } finally {
      setLoadingMessage("");
    }
  };

  // Expert modal helpers
  const handleAddExpert = () => {
    setEditingExpert(null);
    setExpertFormData({
      name: "",
      email: "",
      specialization: "",
      bio: "",
      years_of_experience: "",
      profile_picture: "",
      is_active: true,
    });
    setExpertDateList([]);
    resetExpertDateForm();
    setShowExpertModal(true);
  };

  const handleEditExpert = (exp) => {
    setEditingExpert(exp);
    setExpertFormData({
      name: exp.name,
      email: exp.email || "",
      specialization: exp.specialization || "",
      bio: exp.bio || "",
      years_of_experience: String(exp.years_of_experience || ""),
      profile_picture: exp.profile_picture || "",
      is_active: exp.is_active,
    });
    resetExpertDateForm();
    setShowExpertModal(true);
    loadExpertDates(exp.id);
  };

  const handleSaveExpert = async () => {
    if (!expertFormData.name) {
      setError("Expert name is required.");
      return;
    }
    try {
      setLoadingMessage("Saving expert...");
      const payload = {
        name: expertFormData.name,
        email: expertFormData.email,
        specialization: expertFormData.specialization,
        bio: expertFormData.bio,
        years_of_experience: expertFormData.years_of_experience
          ? parseInt(expertFormData.years_of_experience)
          : null,
        profile_picture: expertFormData.profile_picture || null,
        is_active: expertFormData.is_active,
      };
      if (editingExpert) {
        await consultationAPI.adminUpdateExpert(editingExpert.id, payload);
        showSuccess("Expert updated! ✓");
      } else {
        await consultationAPI.adminCreateExpert(payload);
        showSuccess("Expert created! ✓");
      }
      setShowExpertModal(false);
      await loadConsultationExperts();
    } catch (err) {
      setError(err.message || "Failed to save expert.");
    } finally {
      setLoadingMessage("");
    }
  };

  const handleAddExpertDate = () => {
    if (!editingExpert?.id) {
      setError("Save the expert first before adding specific dates.");
      return;
    }

    resetExpertDateForm();
  };

  const handleEditExpertDate = (dateItem) => {
    setEditingExpertDate(dateItem);
    setExpertDateForm({
      date: dateItem.date || "",
      start_time: dateItem.start_time || "09:00",
      end_time: dateItem.end_time || "17:00",
      is_active: Boolean(dateItem.is_active),
    });
  };

  const handleSaveExpertDate = async () => {
    if (!editingExpert?.id) {
      setError("Save the expert first before adding specific dates.");
      return;
    }

    if (!expertDateForm.date || !expertDateForm.start_time || !expertDateForm.end_time) {
      setError("Please provide date, start time, and end time.");
      return;
    }

    try {
      setLoadingMessage("Saving expert date...");
      const payload = {
        date: expertDateForm.date,
        start_time: expertDateForm.start_time,
        end_time: expertDateForm.end_time,
        is_active: expertDateForm.is_active,
      };

      if (editingExpertDate?.id) {
        await consultationAPI.adminUpdateExpertDate(editingExpert.id, editingExpertDate.id, payload);
        showSuccess("Expert date updated! ✓");
      } else {
        await consultationAPI.adminCreateExpertDate(editingExpert.id, payload);
        showSuccess("Expert date created! ✓");
      }

      await loadExpertDates(editingExpert.id);
      resetExpertDateForm();
    } catch (err) {
      setError(err.message || "Failed to save expert date.");
    } finally {
      setLoadingMessage("");
    }
  };

  const handleDeleteExpertDate = async (dateId) => {
    if (!editingExpert?.id) return;
    if (!confirm("Delete this specific date?")) return;

    try {
      setLoadingMessage("Deleting expert date...");
      await consultationAPI.adminDeleteExpertDate(editingExpert.id, dateId);
      showSuccess("Expert date deleted.");
      await loadExpertDates(editingExpert.id);
      if (editingExpertDate?.id === dateId) {
        resetExpertDateForm();
      }
    } catch (err) {
      setError(err.message || "Failed to delete expert date.");
    } finally {
      setLoadingMessage("");
    }
  };

  const closeExpertModal = () => {
    setShowExpertModal(false);
    setEditingExpert(null);
    setExpertDateList([]);
    resetExpertDateForm();
  };

  const handleDeleteExpert = async (id) => {
    if (!confirm("Delete this expert?")) return;
    try {
      setLoadingMessage("Deleting...");
      await consultationAPI.adminDeleteExpert(id);
      showSuccess("Expert deleted.");
      await loadConsultationExperts();
    } catch (err) {
      setError(err.message || "Failed to delete expert.");
    } finally {
      setLoadingMessage("");
    }
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    try {
      setLoadingMessage("Saving settings...");
      await settingsAPI.save(storeSettings);
      setLoadingMessage("");
      setSettingsSaved(true);
      showSuccess("Settings saved successfully! ✓");
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      setLoadingMessage("");
      setError("Error saving settings: " + (err.message || "Unknown error"));
    }
  };

  const handleSettingsChange = (field, value) => {
    setStoreSettings({
      ...storeSettings,
      [field]: value,
    });
  };

  const handleDownloadConsultationReport = async (format) => {
    try {
      const base = await getActiveApiBase();
      const params = new URLSearchParams();
      params.set("format", format);
      params.set("status", consultationStatusFilter || "All");
      const url = `${base}/consultations/admin/report?${params.toString()}`;
      window.open(url, "_blank");
      showSuccess(`Downloading ${format.toUpperCase()} consultation report...`);
    } catch (err) {
      setError(err.message || "Failed to download consultation report.");
    }
  };

  // Mock orders data
  const mockOrders = orders;

  // Calculate stats
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = mockOrders.length;
  const totalCustomers = users.length || 45;
  const totalProducts = products.length;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <h1>BEIGE</h1>
            <p>Admin Panel</p>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            <span className="btn-icon" aria-hidden="true">
              <Icon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </Icon>
            </span>
            Logout
          </button>
        </div>
      </header>

      <ConnectionStatus />

      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav">
            <button
              className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="nav-icon">
                <NavIcon type="dashboard" />
              </span>
              Dashboard
            </button>
            <button
              className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-icon">
                <NavIcon type="users" />
              </span>
              Users
            </button>
            <button
              className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <span className="nav-icon">
                <NavIcon type="products" />
              </span>
              Products
            </button>
            <button
              className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <span className="nav-icon">
                <NavIcon type="orders" />
              </span>
              Orders
            </button>
            <button
              className={`admin-nav-item ${activeTab === "consultations" ? "active" : ""}`}
              onClick={() => setActiveTab("consultations")}
            >
              <span className="nav-icon">
                <NavIcon type="consultations" />
              </span>
              Consultations
            </button>
            <button
              className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="nav-icon">
                <NavIcon type="settings" />
              </span>
              Settings
            </button>
          </nav>
        </aside>

        <main className="admin-content">
          {error && (
            <div className="admin-error">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="close-btn">
                ✕
              </button>
            </div>
          )}

          {loadingMessage && (
            <div className="admin-loading">
              <span className="spinner"></span>
              <span>{loadingMessage}</span>
            </div>
          )}

          {activeTab === "dashboard" && (
            <>
              <h2 className="admin-section-title">Dashboard Overview</h2>

              {/* Stats Cards */}
              <section className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <NavIcon type="dashboard" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{totalOrders}</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <Icon>
                      <path d="M12 1v22" />
                      <path d="M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" />
                    </Icon>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">
                      NPR {totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <NavIcon type="users" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Customers</span>
                    <span className="stat-value">{totalCustomers}</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="stat-icon">
                    <NavIcon type="products" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{totalProducts}</span>
                  </div>
                </div>
              </section>

              {/* Recent Orders */}
              <section className="admin-dashboard-section">
                <div className="section-header">
                  <h3>Recent Orders</h3>
                  <button className="view-all-btn">View All →</button>
                </div>
                <div className="admin-table">
                  <div className="admin-row admin-head">
                    <span>Order ID</span>
                    <span>Customer</span>
                    <span>Amount</span>
                    <span>Status</span>
                    <span>Date</span>
                  </div>
                  {mockOrders.map((order) => (
                    <div className="admin-row" key={order.id}>
                      <span className="order-id">#{order.id}</span>
                      <span>{order.customer}</span>
                      <span>NPR {order.total.toFixed(2)}</span>
                      <span
                        className={`status-badge status-${(order.status || "Processing").toLowerCase()}`}
                      >
                        {order.status || "Processing"}
                      </span>
                      <span>{order.date}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Products */}
              <section className="admin-dashboard-section">
                <div className="section-header">
                  <h3>Top Products</h3>
                  <button className="view-all-btn">Manage →</button>
                </div>
                <div className="admin-table">
                  <div className="admin-row admin-head">
                    <span>Product Name</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock</span>
                  </div>
                  {products.slice(0, 5).map((product) => (
                    <div className="admin-row" key={product.id}>
                      <span>{product.name}</span>
                      <span>{product.category || "General"}</span>
                      <span>NPR {(product.price || 0).toFixed(2)}</span>
                      <span>In Stock</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "users" && (
            <section className="admin-users">
              <div className="section-header">
                <h2 className="admin-section-title">Users Management</h2>
                <button className="admin-add-btn" onClick={handleAddUser}>
                  + Add User
                </button>
              </div>
              <div className="admin-table users-table">
                <div className="admin-row admin-head">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Joined</span>
                  <span>Actions</span>
                </div>
                {users.map((user) => (
                  <div className="admin-row" key={user.id}>
                    <span className="user-name">{user.name}</span>
                    <span>{user.email}</span>
                    <span>{user.phone || "-"}</span>
                    <span>
                      <span
                        className={`role-badge role-${(user.role || "Customer").toLowerCase()}`}
                      >
                        {user.role || "Customer"}
                      </span>
                    </span>
                    <span>
                      <span
                        className={`status-badge status-${(user.status || "Active").toLowerCase()}`}
                      >
                        {user.status || "Active"}
                      </span>
                    </span>
                    <span>
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <span className="actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              {/* User Modal */}
              {showUserModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal">
                    <div className="modal-header">
                      <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
                      <button
                        className="modal-close"
                        onClick={handleCancelUserModal}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          value={userFormData.name}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter user name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={userFormData.email}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={userFormData.phone}
                          onChange={(e) =>
                            setUserFormData({
                              ...userFormData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Role</label>
                          <select
                            value={userFormData.role}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                role: e.target.value,
                              })
                            }
                          >
                            <option value="Customer">Customer</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={userFormData.status}
                            onChange={(e) =>
                              setUserFormData({
                                ...userFormData,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn-cancel"
                        onClick={handleCancelUserModal}
                      >
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleSaveUser}>
                        {editingUser ? "Update" : "Add"} User
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "products" && (
            <section className="admin-products">
              <div className="section-header">
                <h2 className="admin-section-title">Products Management</h2>
                <button className="admin-add-btn" onClick={handleAddProduct}>
                  + Add Product
                </button>
              </div>
              <div className="admin-table products-table">
                <div className="admin-row admin-head">
                  <span>Product Name</span>
                  <span>Tone</span>
                  <span>Price</span>
                  <span>Category</span>
                  <span>Actions</span>
                </div>
                {products.map((product) => (
                  <div className="admin-row" key={product.id}>
                    <span>{product.name}</span>
                    <span>{product.tone}</span>
                    <span>NPR {(product.price || 0).toFixed(2)}</span>
                    <span>{product.category || "General"}</span>
                    <span className="actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              {/* Product Modal */}
              {showProductModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal">
                    <div className="modal-header">
                      <h2>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </h2>
                      <button
                        className="modal-close"
                        onClick={handleCancelModal}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="modal-body">
                      {/* Image Upload Section */}
                      <div className="form-group">
                        <label>Product Images</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="image-input"
                        />
                        <p className="image-hint">
                          Upload up to 5 images of your product
                        </p>
                      </div>

                      {/* Image Preview Gallery */}
                      {formData.images.length > 0 && (
                        <div className="image-gallery">
                          <label>
                            Image Preview ({formData.images.length})
                          </label>
                          <div className="gallery-grid">
                            {formData.images.map((img, idx) => {
                              return (
                                <div key={img.id} className="gallery-item">
                                  <img
                                    src={resolveMediaUrl(img.src)}
                                    alt={`Product ${idx + 1}`}
                                    onError={(e) => {
                                      e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3C/svg%3E";
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() => handleRemoveImage(img.id)}
                                    title="Remove image"
                                  >
                                    ✕
                                  </button>
                                  {idx === 0 && (
                                    <span className="main-badge">Main</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter product description"
                          rows="3"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val && parseFloat(val) < 0) {
                                val = "0";
                              }
                              setFormData({
                                ...formData,
                                price: val,
                              });
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="form-group">
                          <label>Tone</label>
                          <input
                            type="text"
                            value={formData.tone}
                            onChange={(e) =>
                              setFormData({ ...formData, tone: e.target.value })
                            }
                            placeholder="e.g., Light, Medium"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="">-- Select Category --</option>
                          <option value="Skincare">Skincare</option>
                          <option value="Cleansers">Cleansers</option>
                          <option value="Toners">Toners</option>
                          <option value="Serums">Serums</option>
                          <option value="Moisturizers">Moisturizers</option>
                          <option value="Sunscreen">Sunscreen</option>
                          <option value="Masks">Masks</option>
                          <option value="Makeup">Makeup</option>
                          <option value="Foundation">Foundation</option>
                          <option value="Concealer">Concealer</option>
                          <option value="Eyes">Eyes</option>
                          <option value="Lips">Lips</option>
                          <option value="Blush">Blush</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn-cancel"
                        onClick={handleCancelModal}
                      >
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleSaveProduct}>
                        {editingProduct ? "Update" : "Add"} Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "orders" && (
            <section className="admin-orders">
              <div className="section-header">
                <h2 className="admin-section-title">Orders Management</h2>
                <div className="orders-toolbar">
                  <button
                    className="report-btn"
                    onClick={() => handleDownloadOrdersReport("csv")}
                  >
                    Download CSV
                  </button>
                  <button
                    className="report-btn secondary"
                    onClick={() => handleDownloadOrdersReport("json")}
                  >
                    Download JSON
                  </button>
                </div>
                <div className="status-filters">
                  <button
                    className={`filter-btn ${statusFilter === "All" ? "active" : ""}`}
                    onClick={() => setStatusFilter("All")}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "Processing" ? "active" : ""}`}
                    onClick={() => setStatusFilter("Processing")}
                  >
                    Processing (
                    {orders.filter((o) => o.status === "Processing").length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "Shipped" ? "active" : ""}`}
                    onClick={() => setStatusFilter("Shipped")}
                  >
                    Shipped (
                    {orders.filter((o) => o.status === "Shipped").length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === "Delivered" ? "active" : ""}`}
                    onClick={() => setStatusFilter("Delivered")}
                  >
                    Delivered (
                    {orders.filter((o) => o.status === "Delivered").length})
                  </button>
                </div>
              </div>

              <div className="admin-table orders-table">
                <div className="admin-row admin-head">
                  <span>Order ID</span>
                  <span>Customer</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span>Actions</span>
                </div>
                {orders
                  .filter((order) =>
                    statusFilter === "All"
                      ? true
                      : order.status === statusFilter,
                  )
                  .map((order) => (
                    <div className="admin-row" key={order.id}>
                      <span className="order-id">#{order.id}</span>
                      <span>{order.customer_name}</span>
                      <span>NPR {order.total.toFixed(2)}</span>
                      <span
                        className={`status-badge status-${(order.status || "Processing").toLowerCase()}`}
                      >
                        {order.status || "Processing"}
                      </span>
                      <span>{order.date}</span>
                      <span className="actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          View
                        </button>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Order Details Modal */}
          {showOrderDetailsModal && selectedOrder && (
            <div
              className="admin-modal-overlay"
              onClick={handleCloseOrderDetails}
            >
              <div
                className="admin-modal order-details-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Order Details - {selectedOrder.id}</h2>
                  <button
                    className="modal-close"
                    onClick={handleCloseOrderDetails}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body order-details-body">
                  {/* Customer Info */}
                  <div className="order-section">
                    <h3>Customer Information</h3>
                    <div className="order-info-grid">
                      <div className="info-item">
                        <label>Name</label>
                        <p>{selectedOrder.customer_name}</p>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <p>{selectedOrder.customer_email}</p>
                      </div>
                      <div className="info-item">
                        <label>Phone</label>
                        <p>{selectedOrder.customer_phone || "N/A"}</p>
                      </div>
                      <div className="info-item">
                        <label>Order Date</label>
                        <p>{selectedOrder.date}</p>
                      </div>
                      <div className="info-item">
                        <label>Status</label>
                        <p
                          className={`status-badge status-${(selectedOrder.status || "Processing").toLowerCase()}`}
                        >
                          {selectedOrder.status || "Processing"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="order-section">
                    <h3>Shipping Address</h3>
                    <p>{selectedOrder.shipping_address}</p>
                  </div>

                  {/* Order Items */}
                  <div className="order-section">
                    <h3>Order Items</h3>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items &&
                        selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, idx) => {
                            const itemPrice = parseFloat(
                              item.unit_price || item.price || 0,
                            );
                            const itemQty = parseInt(
                              item.quantity || item.qty || 0,
                            );
                            const itemName =
                              item.product_name || item.product || "Unknown";
                            return (
                              <tr key={idx}>
                                <td>{itemName}</td>
                                <td>{itemQty}</td>
                                <td>NPR {itemPrice.toFixed(2)}</td>
                                <td>NPR {(itemQty * itemPrice).toFixed(2)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>
                              No items in this order
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Total */}
                  <div className="order-section order-total">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>NPR {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Tax:</span>
                      <span>NPR {selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Shipping:</span>
                      <span>NPR {selectedOrder.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="total-row total">
                      <span>Total:</span>
                      <span>NPR {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-cancel"
                    onClick={handleCloseOrderDetails}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Consultations Tab ──────────────────────────────────────── */}
          {activeTab === "consultations" && (
            <section className="admin-consultations">
              <div className="section-header">
                <h2 className="admin-section-title">
                  Consultations Management
                </h2>
              </div>

              {/* Sub-tab navigation */}
              <div className="consult-subtabs">
                {["appointments", "services", "experts"].map((t) => (
                  <button
                    key={t}
                    className={`consult-subtab-btn ${consultationSubTab === t ? "active" : ""}`}
                    onClick={() => handleConsultationTabChange(t)}
                  >
                    {t === "appointments" && "Appointment Bookings"}
                    {t === "services" && "Services"}
                    {t === "experts" && "Experts"}
                  </button>
                ))}
              </div>

              <div className="orders-toolbar" style={{ marginTop: 12 }}>
                <button
                  className="report-btn"
                  onClick={() => handleDownloadConsultationReport("csv")}
                >
                  Download CSV
                </button>
                <button
                  className="report-btn secondary"
                  onClick={() => handleDownloadConsultationReport("json")}
                >
                  Download JSON
                </button>
              </div>

              {/* ── Appointments sub-tab ── */}
              {consultationSubTab === "appointments" && (
                <div>
                  <div className="section-header" style={{ marginTop: 16 }}>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <select
                        value={consultationStatusFilter}
                        onChange={(e) => {
                          setConsultationStatusFilter(e.target.value);
                          loadConsultations(e.target.value);
                        }}
                        className="filter-select"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        className="action-btn edit-btn"
                        onClick={() =>
                          loadConsultations(consultationStatusFilter)
                        }
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {consultations.length === 0 ? (
                    <p className="info-hint" style={{ marginTop: 16 }}>
                      No consultations found.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto", marginTop: 12 }}>
                      <table className="consult-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Expert</th>
                            <th>Date / Time</th>
                            <th>Mode</th>
                            <th>Status</th>
                            <th>Room ID</th>
                            <th>Uploads</th>
                            <th>Assign Slot</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consultations.map((appt) => (
                            <tr key={appt.id}>
                              <td>#{appt.id}</td>
                              <td>
                                <strong>{appt.user?.name || "Guest"}</strong>
                                <br />
                                <small>{appt.user?.email || "-"}</small>
                              </td>
                              <td>{appt.service?.name || "-"}</td>
                              <td>{appt.expert?.name || "-"}</td>
                              <td>
                                {appt.appointment_date} {appt.appointment_time}
                              </td>
                              <td>{appt.consultation_mode}</td>
                              <td>
                                <span
                                  className={`status-badge status-${(appt.status || "").toLowerCase()}`}
                                >
                                  {appt.status}
                                </span>
                              </td>
                              <td>
                                <small>{appt.room_id || "-"}</small>
                              </td>
                              <td>
                                {(appt.attachments || []).map((f) => (
                                  <div key={f.id}>
                                    <a
                                      href={f.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ fontSize: 12 }}
                                    >
                                      {f.file_name}
                                    </a>
                                  </div>
                                ))}
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                    minWidth: 150,
                                  }}
                                >
                                  <input
                                    type="date"
                                    value={
                                      consultationScheduleMap[appt.id]
                                        ?.appointment_date || ""
                                    }
                                    onChange={(e) =>
                                      setConsultationScheduleMap((prev) => ({
                                        ...prev,
                                        [appt.id]: {
                                          ...(prev[appt.id] || {}),
                                          appointment_date: e.target.value,
                                        },
                                      }))
                                    }
                                    disabled={
                                      appt.status === "Completed" ||
                                      appt.status === "Cancelled"
                                    }
                                  />
                                  <input
                                    type="time"
                                    value={
                                      consultationScheduleMap[appt.id]
                                        ?.appointment_time || ""
                                    }
                                    onChange={(e) =>
                                      setConsultationScheduleMap((prev) => ({
                                        ...prev,
                                        [appt.id]: {
                                          ...(prev[appt.id] || {}),
                                          appointment_time: e.target.value,
                                        },
                                      }))
                                    }
                                    disabled={
                                      appt.status === "Completed" ||
                                      appt.status === "Cancelled"
                                    }
                                  />
                                  <button
                                    className="action-btn edit-btn"
                                    onClick={() =>
                                      handleAssignConsultationSlot(appt.id)
                                    }
                                    disabled={
                                      appt.status === "Completed" ||
                                      appt.status === "Cancelled"
                                    }
                                  >
                                    Assign
                                  </button>
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                  }}
                                >
                                  {appt.join_url &&
                                    appt.status !== "Completed" &&
                                    appt.status !== "Cancelled" && (
                                      <button
                                        className="action-btn edit-btn"
                                        onClick={() =>
                                          openDynamicJoinUrl(
                                            appt.join_url,
                                            appt.join_url_candidates || [],
                                          )
                                        }
                                      >
                                        Join
                                      </button>
                                    )}
                                  <button
                                    className="action-btn"
                                    onClick={() =>
                                      handleMarkConsultationComplete(appt.id)
                                    }
                                    disabled={
                                      appt.status === "Completed" ||
                                      appt.status === "Cancelled"
                                    }
                                  >
                                    Complete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Notes section */}
                  {consultations.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ marginBottom: 12 }}>Consultation Notes</h3>
                      {consultations.map((appt) => (
                        <div key={`notes-${appt.id}`} className="notes-card">
                          <strong>
                            #{appt.id} — {appt.service?.name} (
                            {appt.user?.name || "Guest"})
                          </strong>
                          <textarea
                            value={
                              consultationNotesMap[appt.id] !== undefined
                                ? consultationNotesMap[appt.id]
                                : appt.consultation_notes || ""
                            }
                            onChange={(e) =>
                              setConsultationNotesMap((prev) => ({
                                ...prev,
                                [appt.id]: e.target.value,
                              }))
                            }
                            placeholder="Diagnosis, routine recommendations, follow-up advice..."
                            rows={3}
                          />
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleSaveConsultationNotes(appt.id)}
                          >
                            Save Notes
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Services sub-tab ── */}
              {consultationSubTab === "services" && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-header">
                    <h3>Consultation Services</h3>
                    <button
                      className="admin-add-btn"
                      onClick={handleAddService}
                    >
                      + Add Service
                    </button>
                  </div>
                  <div className="admin-table" style={{ marginTop: 12 }}>
                    <div className="admin-row admin-head">
                      <span>Name</span>
                      <span>Description</span>
                      <span>Price (NPR)</span>
                      <span>Duration</span>
                      <span>Active</span>
                      <span>Actions</span>
                    </div>
                    {consultationServices.map((svc) => (
                      <div className="admin-row" key={svc.id}>
                        <span>{svc.name}</span>
                        <span style={{ fontSize: 13 }}>
                          {svc.description || "-"}
                        </span>
                        <span>NPR {Number(svc.price).toFixed(2)}</span>
                        <span>{svc.duration_minutes} min</span>
                        <span>{svc.is_active ? "Yes" : "No"}</span>
                        <span className="actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditService(svc)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteService(svc.id)}
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    ))}
                    {consultationServices.length === 0 && (
                      <div className="admin-row">
                        <span>No services yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Experts sub-tab ── */}
              {consultationSubTab === "experts" && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-header">
                    <h3>Consultation Experts</h3>
                    <button className="admin-add-btn" onClick={handleAddExpert}>
                      + Add Expert
                    </button>
                  </div>
                  <div className="admin-table" style={{ marginTop: 12 }}>
                    <div className="admin-row admin-head">
                      <span>Name</span>
                      <span>Specialization</span>
                      <span>Experience</span>
                      <span>Rating</span>
                      <span>Active</span>
                      <span>Actions</span>
                    </div>
                    {consultationExperts.map((exp) => (
                      <div className="admin-row" key={exp.id}>
                        <span>{exp.name}</span>
                        <span>{exp.specialization || "-"}</span>
                        <span>{exp.years_of_experience || 0} yrs</span>
                        <span>
                          {exp.rating || "N/A"} ({exp.review_count || 0})
                        </span>
                        <span>{exp.is_active ? "Yes" : "No"}</span>
                        <span className="actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditExpert(exp)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteExpert(exp.id)}
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    ))}
                    {consultationExperts.length === 0 && (
                      <div className="admin-row">
                        <span>No experts yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Modal */}
              {showServiceModal && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal">
                    <div className="modal-header">
                      <h2>{editingService ? "Edit Service" : "Add Service"}</h2>
                      <button
                        className="modal-close"
                        onClick={() => setShowServiceModal(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          value={serviceFormData.name}
                          onChange={(e) =>
                            setServiceFormData((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Online Skincare Consultation"
                        />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          rows={3}
                          value={serviceFormData.description}
                          onChange={(e) =>
                            setServiceFormData((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Short description of the service"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Price (NPR) *</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={serviceFormData.price}
                            onChange={(e) =>
                              setServiceFormData((p) => ({
                                ...p,
                                price: e.target.value,
                              }))
                            }
                            placeholder="1999"
                          />
                        </div>
                        <div className="form-group">
                          <label>Duration (minutes) *</label>
                          <input
                            type="number"
                            min="15"
                            value={serviceFormData.duration_minutes}
                            onChange={(e) =>
                              setServiceFormData((p) => ({
                                ...p,
                                duration_minutes: e.target.value,
                              }))
                            }
                            placeholder="30"
                          />
                        </div>
                      </div>
                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={serviceFormData.is_active}
                            onChange={(e) =>
                              setServiceFormData((p) => ({
                                ...p,
                                is_active: e.target.checked,
                              }))
                            }
                          />
                          <span className="checkbox-label">
                            Active (visible to customers)
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn-cancel"
                        onClick={() => setShowServiceModal(false)}
                      >
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleSaveService}>
                        {editingService ? "Update Service" : "Create Service"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expert Modal */}
              {showExpertModal && (
                <div className="admin-modal-overlay" onClick={closeExpertModal}>
                  <div
                    className="admin-modal"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h2>{editingExpert ? "Edit Expert" : "Add Expert"}</h2>
                      <button
                        className="modal-close"
                        onClick={closeExpertModal}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={expertFormData.name}
                          onChange={(e) =>
                            setExpertFormData((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Dr. Aisha Rahman"
                        />
                      </div>
                      <div className="form-group">
                        <label>Specialization</label>
                        <input
                          type="text"
                          value={expertFormData.specialization}
                          onChange={(e) =>
                            setExpertFormData((p) => ({
                              ...p,
                              specialization: e.target.value,
                            }))
                          }
                          placeholder="e.g. Skincare & Dermatology"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={expertFormData.email}
                          onChange={(e) =>
                            setExpertFormData((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          placeholder="expert@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea
                          rows={3}
                          value={expertFormData.bio}
                          onChange={(e) =>
                            setExpertFormData((p) => ({
                              ...p,
                              bio: e.target.value,
                            }))
                          }
                          placeholder="Brief professional background"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Years of Experience</label>
                          <input
                            type="number"
                            min="0"
                            value={expertFormData.years_of_experience}
                            onChange={(e) =>
                              setExpertFormData((p) => ({
                                ...p,
                                years_of_experience: e.target.value,
                              }))
                            }
                            placeholder="5"
                          />
                        </div>
                        <div className="form-group">
                          <label>Profile Picture URL</label>
                          <input
                            type="text"
                            value={expertFormData.profile_picture}
                            onChange={(e) =>
                              setExpertFormData((p) => ({
                                ...p,
                                profile_picture: e.target.value,
                              }))
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={expertFormData.is_active}
                            onChange={(e) =>
                              setExpertFormData((p) => ({
                                ...p,
                                is_active: e.target.checked,
                              }))
                            }
                          />
                          <span className="checkbox-label">
                            Active (visible to customers)
                          </span>
                        </label>
                      </div>

                      {editingExpert?.id ? (
                        <div className="form-group" style={{ marginTop: 16 }}>
                          <div className="section-header" style={{ marginBottom: 12 }}>
                            <h3 style={{ margin: 0 }}>Specific Available Dates</h3>
                            <button
                              type="button"
                              className="admin-add-btn"
                              onClick={handleAddExpertDate}
                            >
                              + New Date
                            </button>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Date</label>
                              <input
                                type="date"
                                value={expertDateForm.date}
                                onChange={(e) =>
                                  setExpertDateForm((p) => ({
                                    ...p,
                                    date: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Start Time</label>
                              <input
                                type="time"
                                value={expertDateForm.start_time}
                                onChange={(e) =>
                                  setExpertDateForm((p) => ({
                                    ...p,
                                    start_time: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>End Time</label>
                              <input
                                type="time"
                                value={expertDateForm.end_time}
                                onChange={(e) =>
                                  setExpertDateForm((p) => ({
                                    ...p,
                                    end_time: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={expertDateForm.is_active}
                                onChange={(e) =>
                                  setExpertDateForm((p) => ({
                                    ...p,
                                    is_active: e.target.checked,
                                  }))
                                }
                              />
                              <span className="checkbox-label">Active</span>
                            </label>
                          </div>

                          <div className="modal-footer" style={{ padding: 0, borderTop: 0, marginBottom: 12 }}>
                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={resetExpertDateForm}
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              className="btn-save"
                              onClick={handleSaveExpertDate}
                              disabled={expertDateLoading}
                            >
                              {editingExpertDate?.id ? "Update Date" : "Save Date"}
                            </button>
                          </div>

                          <div className="admin-table" style={{ marginTop: 8 }}>
                            <div className="admin-row admin-head">
                              <span>Date</span>
                              <span>Time</span>
                              <span>Status</span>
                              <span>Actions</span>
                            </div>
                            {expertDateLoading ? (
                              <div className="admin-row">
                                <span>Loading dates...</span>
                              </div>
                            ) : expertDateList.length > 0 ? (
                              expertDateList.map((dateItem) => (
                                <div className="admin-row" key={dateItem.id}>
                                  <span>{dateItem.date}</span>
                                  <span>
                                    {dateItem.start_time} - {dateItem.end_time}
                                  </span>
                                  <span>{dateItem.is_active ? "Active" : "Inactive"}</span>
                                  <span className="actions">
                                    <button
                                      type="button"
                                      className="action-btn edit-btn"
                                      onClick={() => handleEditExpertDate(dateItem)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="action-btn delete-btn"
                                      onClick={() => handleDeleteExpertDate(dateItem.id)}
                                    >
                                      Delete
                                    </button>
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="admin-row">
                                <span>No specific dates added yet.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="form-group" style={{ marginTop: 16 }}>
                          <div style={{ color: "#6b4b2b" }}>
                            Save the expert first to manage specific available dates.
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn-cancel"
                        onClick={closeExpertModal}
                      >
                        Cancel
                      </button>
                      <button className="btn-save" onClick={handleSaveExpert}>
                        {editingExpert ? "Update Expert" : "Create Expert"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "settings" && (
            <section className="admin-settings">
              <h2 className="admin-section-title">Store Settings</h2>

              {settingsSaved && (
                <div className="settings-success-message">
                  ✓ Settings saved successfully!
                </div>
              )}

              <div className="settings-container">
                {/* Store Information */}
                <div className="settings-section">
                  <h3>Store Information</h3>
                  <div className="form-group">
                    <label>Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        handleSettingsChange("storeName", e.target.value)
                      }
                      placeholder="Enter store name"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Store Email</label>
                      <input
                        type="email"
                        value={storeSettings.storeEmail}
                        onChange={(e) =>
                          handleSettingsChange("storeEmail", e.target.value)
                        }
                        placeholder="contact@store.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Store Phone</label>
                      <input
                        type="tel"
                        value={storeSettings.storePhone}
                        onChange={(e) =>
                          handleSettingsChange("storePhone", e.target.value)
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Store Address</label>
                    <textarea
                      value={storeSettings.storeAddress}
                      onChange={(e) =>
                        handleSettingsChange("storeAddress", e.target.value)
                      }
                      placeholder="123 Main Street, City, State ZIP"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>About Us</label>
                    <textarea
                      value={storeSettings.aboutUs}
                      onChange={(e) =>
                        handleSettingsChange("aboutUs", e.target.value)
                      }
                      placeholder="Write a brief description about your store..."
                      rows="4"
                    />
                  </div>
                </div>

                {/* Financial Settings */}
                <div className="settings-section">
                  <h3>Financial Settings</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={storeSettings.currency}
                        onChange={(e) =>
                          handleSettingsChange("currency", e.target.value)
                        }
                      >
                        <option value="NPR">NPR (Nepalese Rupee)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={storeSettings.taxRate}
                        onChange={(e) =>
                          handleSettingsChange("taxRate", e.target.value)
                        }
                        placeholder="8.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Settings */}
                <div className="settings-section">
                  <h3>Shipping Settings</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Standard Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={storeSettings.shippingCost}
                        onChange={(e) =>
                          handleSettingsChange("shippingCost", e.target.value)
                        }
                        placeholder="10.00"
                      />
                    </div>
                    <div className="form-group">
                      <label>Free Shipping Threshold</label>
                      <input
                        type="number"
                        step="0.01"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) =>
                          handleSettingsChange(
                            "freeShippingThreshold",
                            e.target.value,
                          )
                        }
                        placeholder="100.00"
                      />
                    </div>
                  </div>
                  <p className="settings-hint">
                    Orders above the threshold will qualify for free shipping
                  </p>
                </div>

                {/* System Settings */}
                <div className="settings-section">
                  <h3>System Settings</h3>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={storeSettings.maintenanceMode}
                        onChange={(e) =>
                          handleSettingsChange(
                            "maintenanceMode",
                            e.target.checked,
                          )
                        }
                      />
                      <span className="checkbox-label">
                        Enable Maintenance Mode
                      </span>
                    </label>
                    <p className="settings-hint">
                      When enabled, the store will show a maintenance message to
                      customers
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="settings-actions">
                <button className="btn-save" onClick={handleSaveSettings}>
                  Save Settings
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
