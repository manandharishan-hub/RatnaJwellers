<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // Summary stats
    public function summary(Request $request)
    {
        return response()->json([
            'users' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'new_users_today' => User::whereDate('created_at', now()->toDateString())->count(),
            'orders' => Order::count(),
            'products' => Product::count(),
        ]);
    }

    // Get orders for authenticated user
    public function userOrders(Request $request)
    {
        // Try to get user email from multiple sources
        $userEmail = $request->query('email') 
            ?? auth()->user()?->email 
            ?? $request->header('X-User-Email');
        
        // If still no email, return empty array
        if (!$userEmail) {
            \Log::warning('userOrders: No email provided', [
                'auth_user' => auth()->user()?->email ?? 'none',
                'query_email' => $request->query('email') ?? 'none',
                'header' => $request->header('X-User-Email') ?? 'none',
            ]);
            return response()->json(['orders' => []], 200);
        }

        \Log::info('userOrders: Fetching for email', ['email' => $userEmail]);

        // Get user's orders by email or user_id
        $orders = Order::with('items')
            ->where('customer_email', $userEmail)
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->get();

        \Log::info('userOrders: Found orders', ['count' => count($orders), 'email' => $userEmail]);

        return response()->json(['orders' => $orders]);
    }

    // ==================== USERS ====================
    public function users(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'phone', 'role', 'status', 'created_at')
            ->latest()
            ->paginate(20);

        return response()->json([
            'users' => $users->items(),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'role' => 'required|in:Customer,Admin,Staff',
            'status' => 'required|in:Active,Inactive',
        ]);

        if (strtolower($validated['role']) === 'admin') {
            $validated['role'] = 'admin';
        }

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'status' => $validated['status'],
        ]);
        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function deleteUser(Request $request, User $user)
    {
        // Prevent deleting your own account
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'role' => 'required|in:Customer,Admin,Staff',
            'status' => 'required|in:Active,Inactive',
            'password' => 'nullable|string|min:8',
        ]);

        if (strtolower($validated['role']) === 'admin') {
            $validated['role'] = 'admin';
        }

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'status' => $validated['status'],
        ];

        if ($validated['password'] ?? null) {
            $userData['password'] = bcrypt($validated['password']);
        } else {
            // Ensure password is always set (DB requires it). Generate a random one for admin-created users.
            $generated = Str::random(12);
            $userData['password'] = bcrypt($generated);
            // Optionally log or handle sending this password to the user via email
            
            // Do not expose the generated password in API response by default.
        }

        $user = User::create($userData);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    // ==================== PRODUCTS ====================
    public function products(Request $request)
    {
        $products = Product::select('id', 'name', 'description', 'price', 'tone', 'category', 'stock', 'images', 'created_at', 'updated_at')
            ->latest()
            ->paginate(20);

        return response()->json([
            'products' => $products->items(),
            'total' => $products->total(),
            'per_page' => $products->perPage(),
        ]);
    }

    public function showProduct(Product $product)
    {
        return response()->json(['product' => $product]);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'tone' => 'nullable|string',
            'category' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'stock' => 'nullable|integer|min:0',
        ]);

        // Handle image uploads
        $images = [];
        \Log::info('StoreProduct - Files received: ' . ($request->hasFile('images') ? 'YES' : 'NO'));
        \Log::info('StoreProduct - Image files count: ' . count($request->file('images') ?? []));
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                \Log::info('Storing image: ' . $image->getClientOriginalName());
                $path = $image->store('products', 'public');
                \Log::info('Image stored at path: ' . $path);
                $images[] = [
                    'src' => '/storage/' . $path,
                    'name' => $image->getClientOriginalName()
                ];
            }
        }

        $productData = $validated;
        $productData['images'] = !empty($images) ? json_encode($images) : json_encode([]);
        \Log::info('Saving product with images: ' . $productData['images']);

        $product = Product::create($productData);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:products,name,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'tone' => 'nullable|string',
            'category' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'keep_images' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
        ]);

        // Merge existing images with new ones
        $images = [];
        
        // First, add images to keep from existing product
        if ($request->input('keep_images')) {
            $keepImages = json_decode($request->input('keep_images'), true) ?: [];
            \Log::info('Keeping images: ' . count($keepImages));
            $images = array_merge($images, $keepImages);
        }
        
        // Then, add newly uploaded images
        \Log::info('UpdateProduct - Files received: ' . ($request->hasFile('images') ? 'YES' : 'NO'));
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                \Log::info('Storing new image: ' . $image->getClientOriginalName());
                $path = $image->store('products', 'public');
                \Log::info('Image stored at path: ' . $path);
                $images[] = [
                    'src' => '/storage/' . $path,
                    'name' => $image->getClientOriginalName()
                ];
            }
        }

        // If no images provided, keep existing ones
        if (empty($images) && $product->images) {
            \Log::info('No new images, keeping existing');
            $validated['images'] = $product->images;
        } else {
            $validated['images'] = !empty($images) ? json_encode($images) : json_encode([]);
        }

        \Log::info('Updating product with images: ' . $validated['images']);
        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function deleteProduct(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    // ==================== ORDERS ====================
    public function orders(Request $request)
    {
        $status = $request->query('status');

        $query = Order::with('items')->latest();

        if ($status && $status !== 'All') {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'orders' => $orders->items(),
            'total' => $orders->total(),
            'per_page' => $orders->perPage(),
        ]);
    }

    public function showOrder(Order $order)
    {
        $order->load('items', 'user');

        return response()->json(['order' => $order]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }

    public function storeOrder(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'shipping_address' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        try {
            $order = DB::transaction(function () use ($validated) {
                $order = Order::create([
                    'order_number' => 'BEIGE-' . time(),
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'shipping_address' => $validated['shipping_address'],
                    'subtotal' => $validated['subtotal'],
                    'tax' => $validated['tax'] ?? 0,
                    'shipping_cost' => $validated['shipping_cost'] ?? 0,
                    'total' => $validated['total'],
                    'status' => 'Processing',
                ]);

                foreach ($validated['items'] as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'] ?? null,
                        'product_name' => $item['product_name'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                    ]);
                }

                return $order;
            });

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
    }

    public function deleteOrder(Order $order)
    {
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function downloadOrdersReport(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:All,Pending,Processing,Shipped,Delivered,Cancelled',
            'format' => 'nullable|string|in:csv,json',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $status = $validated['status'] ?? 'All';
        $format = $validated['format'] ?? 'csv';

        $query = Order::with('items')->latest();

        if ($status !== 'All') {
            $query->where('status', $status);
        }

        if (!empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }

        if (!empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $orders = $query->get();

        $rows = $orders->map(function ($order) {
            $itemCount = $order->items->sum('quantity');
            $itemSummary = $order->items
                ->map(fn ($item) => $item->product_name . ' x' . $item->quantity)
                ->implode(' | ');

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'status' => $order->status,
                'item_count' => $itemCount,
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax,
                'shipping_cost' => (float) $order->shipping_cost,
                'total' => (float) $order->total,
                'created_at' => optional($order->created_at)->toDateTimeString(),
                'items' => $itemSummary,
            ];
        })->values();

        $timestamp = now()->format('Ymd_His');
        $statusSlug = strtolower($status);

        if ($format === 'json') {
            $fileName = "orders_report_{$statusSlug}_{$timestamp}.json";

            return response()->json([
                'generated_at' => now()->toDateTimeString(),
                'filters' => [
                    'status' => $status,
                    'from' => $validated['from'] ?? null,
                    'to' => $validated['to'] ?? null,
                ],
                'count' => $rows->count(),
                'orders' => $rows,
            ])->withHeaders([
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);
        }

        $fileName = "orders_report_{$statusSlug}_{$timestamp}.csv";

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Order ID',
                'Order Number',
                'Customer Name',
                'Customer Email',
                'Status',
                'Item Count',
                'Subtotal',
                'Tax',
                'Shipping Cost',
                'Total',
                'Created At',
                'Items',
            ]);

            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row['order_id'],
                    $row['order_number'],
                    $row['customer_name'],
                    $row['customer_email'],
                    $row['status'],
                    $row['item_count'],
                    $row['subtotal'],
                    $row['tax'],
                    $row['shipping_cost'],
                    $row['total'],
                    $row['created_at'],
                    $row['items'],
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    // ==================== SETTINGS ====================
    public function getSettings()
    {
        $settings = DB::table('settings')->pluck('value', 'key');

        return response()->json([
            'settings' => $settings,
        ]);
    }

    public function saveSettings(Request $request)
    {
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->all() as $key => $value) {
                    DB::table('settings')->updateOrInsert(
                        ['key' => $key],
                        ['value' => is_array($value) ? json_encode($value) : $value, 'updated_at' => now()]
                    );
                }
            });

            return response()->json(['message' => 'Settings saved successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to save settings: ' . $e->getMessage()], 500);
        }
    }

    // ==================== ORDERS - PAYMENT VERIFICATION ====================
    public function verifyPayment(Request $request)
    {
        try {
            \Log::info('Payment verification request received:', [
                'all_data' => $request->all(),
                'has_order' => $request->has('order'),
                'has_txn' => $request->has('txn_code'),
            ]);

            $data = $request->validate([
                'txn_code' => 'required|string',
                'order' => 'required|array',
            ]);

            $orderData = $data['order'];
            
            // Extract customer info (handle both 'customer' and direct fields)
            $customer = $orderData['customer'] ?? $orderData;
            $customerName = $customer['fullName'] ?? $customer['name'] ?? 'Guest Customer';
            $customerEmail = $customer['email'] ?? '';
            $customerPhone = $customer['phone'] ?? '';
            $customerAddress = ($customer['address'] ?? '') . ', ' . ($customer['city'] ?? '');
            
            // Extract order totals
            $subtotal = floatval($orderData['subtotal'] ?? 0);
            $tax = floatval($orderData['tax'] ?? 0);
            $shipping = floatval($orderData['shipping'] ?? 0);
            $total = floatval($orderData['total'] ?? ($subtotal + $tax + $shipping));
            
            // Extract items
            $items = $orderData['items'] ?? [];

            \Log::info('Payment verification data extracted:', [
                'txn_code' => $data['txn_code'],
                'customer_name' => $customerName,
                'total' => $total,
                'items_count' => count($items),
            ]);

            if (empty($items)) {
                throw new \Exception('No items in order');
            }

            // Check if order already exists
            $existingOrder = Order::where('order_number', 'ORD-' . $data['txn_code'])->first();
            if ($existingOrder) {
                \Log::info('Order already exists:', ['order_id' => $existingOrder->id]);
                return response()->json([
                    'success' => true,
                    'message' => 'Order already processed',
                    'order_id' => $existingOrder->id,
                    'order_number' => $existingOrder->order_number,
                ], 200);
            }

            // Create order
            $order = Order::create([
                'order_number' => 'ORD-' . $data['txn_code'],
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'shipping_address' => trim($customerAddress, ', '),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shipping,
                'total' => $total,
                'status' => 'Processing', // Use valid enum value
            ]);

            \Log::info('Order created successfully:', [
                'order_id' => $order->id, 
                'order_number' => $order->order_number,
                'total' => $order->total,
            ]);

            // Create order items
            foreach ($items as $item) {
                $productId = $item['id'] ?? null;
                $productName = $item['name'] ?? $item['title'] ?? 'Product';
                $quantity = intval($item['quantity'] ?? 1);
                $price = floatval($item['price'] ?? 0);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'total_price' => $price * $quantity,
                ]);
                
                \Log::info('Order item created:', [
                    'product_name' => $productName,
                    'quantity' => $quantity,
                    'price' => $price,
                ]);
            }

            \Log::info('All order items created for order: ' . $order->id);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Payment verification validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid payment data',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Payment verification failed:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process order: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ==================== eSEWA PAYMENT ====================
    public function generateEsewaSignature(Request $request)
    {
        try {
            $request->validate([
                'total_amount' => 'required|numeric',
                'transaction_uuid' => 'required|string',
                'product_code' => 'required|string',
            ]);

            // eSewa secret key - Use test key for RC/EPAYTEST environment
            // For production: Get this from your eSewa merchant dashboard
            $secretKey = env('ESEWA_SECRET_KEY', 'test_secret_key');

            $totalAmount = $request->input('total_amount');
            $transactionUUID = $request->input('transaction_uuid');
            $productCode = $request->input('product_code');

            // Generate HMAC-SHA256 signature
            // Message format: total_amount={amount},transaction_uuid={uuid},product_code={code}
            $message = "total_amount={$totalAmount},transaction_uuid={$transactionUUID},product_code={$productCode}";
            
            $signature = base64_encode(
                hash_hmac('sha256', $message, $secretKey, true)
            );

            \Log::info('eSewa signature generated', [
                'transaction_uuid' => $transactionUUID,
                'total_amount' => $totalAmount,
                'product_code' => $productCode,
                'signature' => substr($signature, 0, 20) . '...', // Log partial signature for security
            ]);

            return response()->json([
                'signature' => $signature,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            \Log::error('eSewa signature generation failed:', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate signature: ' . $e->getMessage(),
            ], 400);
        }
    }

    // ==================== REVIEWS & RATINGS ====================
    public function createReview(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
            'customer_name' => 'nullable|string',
            'customer_email' => 'nullable|email',
        ]);

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'rating' => $validated['rating'],
            'review' => $validated['review'],
            'customer_name' => $validated['customer_name'] ?? auth()->user()?->name,
            'customer_email' => $validated['customer_email'] ?? auth()->user()?->email,
            'verified_purchase' => true,
        ]);

        return response()->json([
            'message' => 'Review added successfully',
            'review' => $review,
        ], 201);
    }

    public function getProductReviews(Product $product)
    {
        $reviews = $product->reviews()
            ->latest()
            ->get();

        $avgRating = $reviews->avg('rating') ?? 0;

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($avgRating, 1),
            'total_reviews' => count($reviews),
        ]);
    }

    // ==================== COUPONS ====================
    public function validateCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'total' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($validated['code']))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired coupon code',
            ], 404);
        }

        if ($coupon->min_purchase && $validated['total'] < $coupon->min_purchase) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum purchase of NPR {$coupon->min_purchase} required",
            ], 422);
        }

        $discount = $coupon->calculateDiscount($validated['total']);

        return response()->json([
            'valid' => true,
            'message' => 'Coupon applied successfully',
            'discount' => round($discount, 2),
            'discount_type' => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
        ]);
    }

    public function getCoupons()
    {
        $coupons = Coupon::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>', now());
            })
            ->get();

        return response()->json(['coupons' => $coupons]);
    }

    public function createCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expiry_date' => 'nullable|datetime',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($validated['code']),
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'min_purchase' => $validated['min_purchase'],
            'max_uses' => $validated['max_uses'],
            'expiry_date' => $validated['expiry_date'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Coupon created successfully',
            'coupon' => $coupon,
        ], 201);
    }
}


