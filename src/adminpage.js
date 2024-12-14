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

  // Mark order as completed or pending
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }), // Send updated status
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to update order status: ${errorMessage}`);
      }

      // Update order status locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Handle the new order alert dismissal
  const handleNewOrderAlert = () => {
    setNewOrderAlert(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-semibold mb-8 text-center text-indigo-600">
        Restaurant Admin - Orders
      </h1>

      {/* New Order Alert */}
      {newOrderAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleNewOrderAlert}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              New Order Received!
            </h3>
            <button
              onClick={handleNewOrderAlert}
              className="bg-indigo-500 text-white px-8 py-3 rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Orders Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Recent Orders</h2>
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white p-6 rounded-lg shadow-md border ${
                order.status === "completed"
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                {/* Left Side (Order Info) */}
                <div className="flex flex-col space-y-2 w-1/2 text-sm">
                  <div className="text-lg font-medium text-indigo-700">
                    Order ID: {order._id}
                  </div>
                  <div className="text-xs text-gray-600">
                    Customer: {order.customerName}
                  </div>
                  <div className="text-xs text-gray-600">
                    Phone: {order.customerPhone}
                  </div>
                  <div className="text-xs text-gray-600">
                    Order Date: {new Date(order.orderDate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-800 font-semibold mt-2">
                    Total Bill: ${order.totalPrice?.toFixed(2)}
                  </div>
                </div>

                {/* Right Side (Ordered Items & Action) */}
                <div className="w-1/2 pl-8">
                  {/* Ordered Items */}
                  <div className="mb-4">
                    <div className="text-xl font-semibold text-gray-800 mb-2">
                      Ordered Items:
                    </div>
                    {order.items.map((item, index) => (
                      <div key={index} className="text-lg text-gray-700 mb-2">
                        <strong>{item.name}</strong> - Spice Level:{" "}
                        {item.spiceLevel} (Qty: {item.quantity})
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleMark(order._id)}
                      className={`bg-${
                        order.status === "completed" ? "red" : "green"
                      }-500 text-white px-6 py-2 rounded-md text-sm`}
                    >
                      {order.status === "completed"
                        ? "Unmark"
                        : "Mark as Completed"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
