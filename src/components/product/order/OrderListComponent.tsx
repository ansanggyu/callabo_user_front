import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IOrderItem, IOrderList } from "../../../types/order/iorder.ts";
import useAuthStore from "../../../stores/customer/AuthStore.ts";
import { fetchOrdersByCustomer } from "../../../apis/order/orderAPI.ts";

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function OrderListComponent() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<IOrderList[]>([]); // 주문 목록 상태 관리
    const [loading, setLoading] = useState(true); // 로딩 상태 관리
    const [error, setError] = useState<string | null>(null); // 에러 상태 관리

    const { customer } = useAuthStore();
    const customerId = customer?.customerId;

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const fetchedOrders = await fetchOrdersByCustomer(customer?.customerId || ""); // API 호출
                setOrders(fetchedOrders);
            } catch (err: any) {
                setError(err.message || "주문 내역을 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [customerId]);

    const moveToRegister = (product: IOrderItem, order: IOrderList) => {
        navigate("/review/register", {
            state: {
                productNo: product.productNo,
                productName: product.productName,
                creatorId: order.creatorId,
                customerId: customer?.customerId,
            }
        });
    };

    const moveToQnARegister = (product: IOrderItem, order: IOrderList) => {

        console.log("CreatorId:", order.creatorId); // 로그로 creatorId 확인
        console.log("ProductNo:", product.productNo);

        navigate("/qna/register", {
            state: {
                productNo: product.productNo,
                creatorId: order.creatorId,
                customerId: customer?.customerId,
            },
        });
    };

    if (loading) {
        return <div className="text-center mt-10">주문 내역을 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto mt-5 pb-5 px-4 lg:px-8">
            {orders.map((order) => (
                <div key={order.orderNo} className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="text-gray-500 text-sm mb-2">{formatDateTime(order.orderDate)}</div>
                    <div className="text-black font-bold flex items-center mb-4">{order.creatorName}</div>
                    {order.items.map((product) => (
                        <div key={product.productNo} className="flex items-start mb-4">
                            <img
                                src={product.productImage || "https://via.placeholder.com/150"}
                                alt={product.productName}
                                className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div className="flex-grow">
                                <div className="text-gray-700 text-sm">카테고리</div>
                                <div className="font-bold text-gray-800">{product.productName}</div>
                                <div className="text-gray-700 text-sm mt-1">{product.unitPrice.toLocaleString()} 원</div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100"
                                    onClick={() => moveToRegister(product, order)}
                                >
                                    리뷰 쓰기
                                </button>
                                <button
                                    className="px-4 py-2 border border-gray-400 rounded text-sm hover:bg-gray-100"
                                    onClick={() => moveToQnARegister(product, order)}
                                >
                                    Q&A 쓰기
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-black font-bold flex-1">{order.status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default OrderListComponent;
