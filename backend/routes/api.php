<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\OtpController;

Route::middleware('web')->group(function () {
	Route::get('/auth/csrf', function () {
		return response()->json([
			'token' => csrf_token(),
		]);
	});
	Route::post('/auth/register', [AuthController::class, 'register']);
	Route::post('/auth/login', [AuthController::class, 'login']);
	Route::post('/auth/google', [AuthController::class, 'googleSignup']);
	Route::post('/auth/forgot', [AuthController::class, 'forgotPassword']);
	Route::post('/auth/reset', [AuthController::class, 'resetPassword']);
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
	Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

	Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
	Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

	// OTP Authentication
	Route::post('/auth/otp/send', [OtpController::class, 'sendOtp']);
	Route::post('/auth/otp/verify', [OtpController::class, 'verifyOtp']);

	Route::prefix('user')->group(function () {
		Route::get('/orders', [AdminController::class, 'userOrders']);
	});

	Route::prefix('admin')->group(function () {
		Route::get('/summary', [AdminController::class, 'summary']);

		// Users routes
		Route::get('/users', [AdminController::class, 'users']);
		Route::post('/users', [AdminController::class, 'storeUser']);
		Route::put('/users/{user}', [AdminController::class, 'updateUser']);
		Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);

		// Products routes
		Route::get('/products', [AdminController::class, 'products']);
		Route::get('/products/{product}', [AdminController::class, 'showProduct']);
		Route::post('/products', [AdminController::class, 'storeProduct']);
		Route::put('/products/{product}', [AdminController::class, 'updateProduct']);
		Route::delete('/products/{product}', [AdminController::class, 'deleteProduct']);

		// Orders routes
		Route::get('/orders', [AdminController::class, 'orders']);
		Route::get('/orders/report', [AdminController::class, 'downloadOrdersReport']);
		Route::get('/orders/{order}', [AdminController::class, 'showOrder']);
		Route::post('/orders', [AdminController::class, 'storeOrder']);
		Route::put('/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
		Route::delete('/orders/{order}', [AdminController::class, 'deleteOrder']);

		// Settings routes
		Route::get('/settings', [AdminController::class, 'getSettings']);
		Route::post('/settings', [AdminController::class, 'saveSettings']);
	});

	// Orders routes (for customer orders)
	Route::prefix('orders')->group(function () {
		Route::post('/verify-payment', [AdminController::class, 'verifyPayment']);
		Route::post('/generate-signature', [AdminController::class, 'generateEsewaSignature']);
	});

	// Products routes (for public access)
	Route::prefix('products')->group(function () {
		Route::get('/{product}/reviews', [AdminController::class, 'getProductReviews']);
		Route::post('/{product}/reviews', [AdminController::class, 'createReview']);
	});

	// Coupons routes
	Route::prefix('coupons')->group(function () {
		Route::post('/validate', [AdminController::class, 'validateCoupon']);
		Route::get('/', [AdminController::class, 'getCoupons']);
	});

	// Consultation booking routes
	Route::prefix('consultations')->group(function () {
		Route::get('/catalog', [ConsultationController::class, 'catalog']);
		Route::get('/available-dates', [ConsultationController::class, 'availableDates']);
		Route::get('/slots', [ConsultationController::class, 'availableSlots']);
		Route::post('/book', [ConsultationController::class, 'book']);
		Route::get('/my', [ConsultationController::class, 'userAppointments']);
			Route::get('/my/report', [ConsultationController::class, 'userReport']);
		Route::post('/{consultation}/cancel', [ConsultationController::class, 'cancel']);
		Route::post('/{consultation}/reschedule', [ConsultationController::class, 'reschedule']);
		Route::post('/reminders/send-due', [ConsultationController::class, 'sendDueReminders']);

		Route::prefix('admin')->group(function () {
			Route::get('/', [ConsultationController::class, 'adminAppointments']);
			Route::get('/report', [ConsultationController::class, 'adminReport']);
			Route::post('/{consultation}/notes', [ConsultationController::class, 'addNotes']);
			Route::post('/{consultation}/complete', [ConsultationController::class, 'complete']);
			Route::post('/{consultation}/assign-slot', [ConsultationController::class, 'adminAssignSlot']);

			// Services CRUD
			Route::get('/services', [ConsultationController::class, 'adminListServices']);
			Route::post('/services', [ConsultationController::class, 'adminStoreService']);
			Route::put('/services/{id}', [ConsultationController::class, 'adminUpdateService']);
			Route::delete('/services/{id}', [ConsultationController::class, 'adminDeleteService']);

			// Experts CRUD
			Route::get('/experts', [ConsultationController::class, 'adminListExperts']);
			Route::post('/experts', [ConsultationController::class, 'adminStoreExpert']);
			Route::put('/experts/{id}', [ConsultationController::class, 'adminUpdateExpert']);
			Route::delete('/experts/{id}', [ConsultationController::class, 'adminDeleteExpert']);
			Route::get('/experts/{expertId}/dates', [ConsultationController::class, 'adminListExpertDates']);
			Route::post('/experts/{expertId}/dates', [ConsultationController::class, 'adminStoreExpertDate']);
			Route::put('/experts/{expertId}/dates/{dateId}', [ConsultationController::class, 'adminUpdateExpertDate']);
			Route::delete('/experts/{expertId}/dates/{dateId}', [ConsultationController::class, 'adminDeleteExpertDate']);
		});
	});
});
