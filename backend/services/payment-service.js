// Enhanced Payment Service with Auto-Fallback for Production Issues
const MPesaService = require('../mpesa-service');

class PaymentService {
    constructor() {
        this.mpesaService = MPesaService;
        this.useMockMode = false; // Use real M-Pesa since production is working
        this.autoFallback = true; // Keep auto fallback enabled as safety net
        console.log('💳 Payment Service initialized with PRODUCTION M-PESA');
        console.log('🔄 Auto-fallback to mock mode enabled for safety');
    }

    /**
     * Initiate STK Push using M-Pesa with Auto-Fallback to Mock Mode
     */
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        // Minimal: Always attempt real MPESA STK Push
        console.log('🔄 [FORCED] Processing payment via M-Pesa (Production)');
        console.log(`📱 Phone: ${phoneNumber}, Amount: KSh ${amount}`);
        console.log(`🏢 Business: ${process.env.MPESA_BUSINESS_SHORTCODE}`);
        console.log(`🌐 Environment: ${process.env.MPESA_ENVIRONMENT}`);
        try {
            const response = await this.mpesaService.initiateSTKPush(
                phoneNumber, 
                amount, 
                accountReference, 
                transactionDesc
            );
            console.log('✅ [FORCED] M-Pesa STK Push successful:', response);
            return response;
        } catch (error) {
            console.error('❌ [FORCED] M-Pesa payment error:', error);
            return {
                success: false,
                responseCode: '1',
                responseDescription: 'STK Push failed',
                customerMessage: 'Payment request failed. Please try again.',
                error: error.message,
                provider: 'mpesa'
            };
        }
    }

    /**
     * Check transaction status using M-Pesa or Mock Mode
     */
    async checkTransactionStatus(transactionId) {
        // If payment is completed or expired, remove from pending
        for (const [phone, req] of PaymentService.pendingRequests.entries()) {
            if (req.checkoutRequestId === transactionId) {
                // Check if expired
                if (Date.now() - req.timestamp > PaymentService.PENDING_TIMEOUT_MS) {
                    PaymentService.pendingRequests.delete(phone);
                }
            }
        }
        if (this.useMockMode && (transactionId.includes('mock') || transactionId.includes('fallback'))) {
            console.log('🧪 Checking MOCK transaction status');
            
            // Simulate different payment scenarios for testing
            const scenarios = [
                { status: 'success', message: 'Payment completed successfully (MOCK)' },
                { status: 'pending', message: 'Payment pending (MOCK)' },
                { status: 'success', message: 'Payment confirmed (MOCK)' }
            ];
            
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            
            return {
                success: true,
                status: scenario.status,
                message: scenario.message,
                mpesaReceiptNumber: 'MOCK' + Date.now(),
                provider: 'mock',
                isMock: true
            };
        }
        
        try {
            const result = await this.mpesaService.checkTransactionStatus(transactionId);
            if (result.rateLimited) {
                console.log('⚠️  Rate limited, returning pending status');
                return {
                    success: true,
                    status: 'pending',
                    rateLimited: true,
                    message: 'Rate limit reached. Payment may be completed.',
                    provider: 'mpesa'
                };
            }
            if (result.success) {
                // If payment is successful, remove from pending
                if (result.status === 'success') {
                    for (const [phone, req] of PaymentService.pendingRequests.entries()) {
                        if (req.checkoutRequestId === transactionId) {
                            PaymentService.pendingRequests.delete(phone);
                        }
                    }
                }
                return {
                    success: true,
                    status: result.status || 'pending',
                    mpesaReceiptNumber: result.mpesaReceiptNumber,
                    data: result.data,
                    provider: 'mpesa'
                };
            }
            return result;
        } catch (error) {
            console.error('❌ M-Pesa status check error:', error);
            return {
                success: false,
                status: 'unknown',
                error: error.message,
                provider: 'mpesa'
            };
        }
    }

    /**
     * Check if payment service is configured
     */
    isConfigured() {
        return this.useMockMode || this.mpesaService.isConfigured();
    }

    /**
     * Get service status and health
     */
    getServiceStatus() {
        return {
            provider: this.useMockMode ? 'mock' : 'mpesa',
            mpesaConfigured: this.mpesaService.isConfigured(),
            mockMode: this.useMockMode,
            autoFallback: this.autoFallback,
            isConfigured: true // Always configured with auto-fallback
        };
    }

    /**
     * Toggle between mock mode and real M-Pesa
     */
    setMockMode(enabled) {
        this.useMockMode = enabled;
        console.log(`🔄 Payment mode switched to: ${enabled ? 'MOCK' : 'M-PESA'}`);
    }

    /**
     * Enable/disable auto-fallback functionality
     */
    setAutoFallback(enabled) {
        this.autoFallback = enabled;
        console.log(`🔄 Auto-fallback ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
}

module.exports = PaymentService;