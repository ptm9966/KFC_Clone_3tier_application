import {
    Box,
    Button,
    Flex,
    Heading,
    Select,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const statusOptions = ["Placed", "Processing", "Ready", "Delivered", "Cancelled"];

export const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingOrderId, setSavingOrderId] = useState("");
    const toast = useToast();

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/orders`);
            const data = await response.json();
            const orderList = Array.isArray(data) ? data : [];
            setOrders(orderList);
            setStatusDrafts(
                orderList.reduce((drafts, order) => {
                    drafts[order._id] = order.status || "Placed";
                    return drafts;
                }, {})
            );
        } catch (error) {
            toast({
                title: "Unable to load orders",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const updateOrderStatus = async (orderId) => {
        try {
            setSavingOrderId(orderId);
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: statusDrafts[orderId] }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.err || "Unable to update order");
            }

            setOrders((prev) =>
                prev.map((order) => (order._id === orderId ? data.order : order))
            );
            toast({
                title: "Order status updated",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Unable to update status",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSavingOrderId("");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    if (loading) {
        return (
            <Flex minH="300px" align="center" justify="center">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box w="95%" m="30px auto" textAlign="left">
            <Flex mb="20px" justify="space-between" align="center" gap="16px" flexWrap="wrap">
                <Heading size="md">All Orders</Heading>
                <Button onClick={fetchOrders} bg="black" color="white" _hover={{ bg: "black" }}>
                    Refresh
                </Button>
            </Flex>

            {!orders.length ? (
                <Box bg="white" p="24px" borderRadius="8px" boxShadow="base">
                    <Text color="gray.600">No orders found.</Text>
                </Box>
            ) : (
                <SimpleGrid columns={[1, 1, 2, 3]} spacing="18px">
                    {orders.map((order) => (
                        <Box key={order._id} bg="white" p="18px" borderRadius="8px" boxShadow="base">
                            <Flex justify="space-between" gap="12px" align="start">
                                <Box>
                                    <Heading size="sm">#{order.orderNo}</Heading>
                                    <Text color="gray.600" fontSize="sm">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </Text>
                                </Box>
                                <Text color="green.600" fontWeight="bold">
                                    {order.status}
                                </Text>
                            </Flex>

                            <VStack align="stretch" mt="14px" spacing="8px">
                                <Text><b>User:</b> {order.userName || "Customer"}</Text>
                                <Text><b>Mobile:</b> {order.userMobile || "N/A"}</Text>
                                <Text><b>Payment:</b> {order.paymentMethod}</Text>
                                <Text><b>Total:</b> Rs. {order.totalPrice}</Text>
                                <Text><b>Items:</b> {order.items?.map((item) => `${item.title} x ${item.qty}`).join(", ")}</Text>
                            </VStack>

                            <Flex mt="18px" gap="10px">
                                <Select
                                    value={statusDrafts[order._id] || "Placed"}
                                    onChange={(event) =>
                                        setStatusDrafts((prev) => ({
                                            ...prev,
                                            [order._id]: event.target.value,
                                        }))
                                    }
                                >
                                    {statusOptions.map((status) => (
                                        <option value={status} key={status}>
                                            {status}
                                        </option>
                                    ))}
                                </Select>
                                <Button
                                    bg="#e4002b"
                                    color="white"
                                    _hover={{ bg: "#c90026" }}
                                    isLoading={savingOrderId === order._id}
                                    onClick={() => updateOrderStatus(order._id)}
                                >
                                    Submit
                                </Button>
                            </Flex>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
};
