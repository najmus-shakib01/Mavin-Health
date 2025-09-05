/* eslint-disable react/prop-types */
import { FaEye, FaShoppingCart } from "react-icons/fa";

const ProductMessage = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex gap-4">
            <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600">
                        {product.price}
                    </span>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            <FaShoppingCart className="w-3 h-3" />
                            Add to cart
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                            <FaEye className="w-3 h-3" />
                            Try online
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {product.features.map((feature, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                            {feature}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default ProductMessage;