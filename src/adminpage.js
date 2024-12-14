import React, { useState, useEffect } from "react";

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);

  // Fetch orders from the server
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "https://appresbackend.onrender.com/api/orders"
      );
      const data = await response.json();

      // Check if there are new orders
      if (data.length > prevOrdersCount) {
        setNewOrderAlert(true);
      }

      // Update orders state
      setOrders(data);
      setPrevOrdersCount(data.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [orders]);

  // Handle new order alert dismissal
  const handleNewOrderAlert = () => {
    setNewOrderAlert(false);
  };

  // Handle marking order as "completed" or "pending"
  const handleMark = async (orderId) => {
    try {
      const orderToUpdate = orders.find((order) => order._id === orderId);
      const newStatus =
        orderToUpdate.status === "completed" ? "pending" : "completed";

      const response = await fetch(
        `https://appresbackend.onrender.com/api/orders/${orderId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // Ensure Content-Type is set correctly
          },
          body: JSON.stringify({ status: newStatus }), // Send updated status
        }
      );

      // Check if the response is okay
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to update order status: ${errorMessage}`);
      }

      // Update the order status locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Restaurant Admin - Orders
      </h1>

      {/* New Order Alert */}
      {newOrderAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleNewOrderAlert}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">New Order Received!</h3>
            <button
              onClick={handleNewOrderAlert}
              className="bg-blue-500 text-white px-6 py-3 rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Orders Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Order Info</th>
                <th className="px-6 py-3 text-left text-sm">Order Details</th>
                <th className="px-6 py-3 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className={`border-b ${
                    order.status === "completed" ? "bg-green-100" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm">
                    <div
                      className={
                        order.status === "completed"
                          ? "line-through text-gray-500"
                          : ""
                      }
                    >
                      <strong>Order ID:</strong> {order._id}
                    </div>
                    <div
                      className={
                        order.status === "completed"
                          ? "line-through text-gray-500"
                          : ""
                      }
                    >
                      <strong>Customer:</strong> {order.customerName}
                    </div>
                    <div
                      className={
                        order.status === "completed"
                          ? "line-through text-gray-500"
                          : ""
                      }
                    >
                      <strong>Phone:</strong> {order.customerPhone}
                    </div>
                    <div
                      className={
                        order.status === "completed"
                          ? "line-through text-gray-500"
                          : ""
                      }
                    >
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.orderDate).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className={
                          order.status === "completed"
                            ? "line-through text-gray-500"
                            : ""
                        }
                      >
                        <strong>{item.name}</strong> - Spice Level:{" "}
                        {item.spiceLevel} (Qty: {item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleMark(order._id)}
                      className={`bg-${
                        order.status === "completed" ? "red" : "blue"
                      }-500 text-white px-4 py-2 rounded-md text-xs`}
                    >
                      {order.status === "completed" ? "Unmark" : "Mark"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
