(function () {
    var app = angular.module('app');

    // Factory are better than Services

    app.factory('POService', ['$http', '$cookies', function ($http, $cookies) {

        $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        var factory = {};
        factory.getSchema = function () {
            return $http.get('/api/v1/po-schema/');
        }
        factory.get = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po/', {
                params: params
            });
        };
        factory.getOne = function (id) {
            if (id) {
                return $http.get('/api/v1/po/' + id);
            }
        };
        factory.post = function (data) {
            return $http.post('/api/v1/po/', data);
        };
        factory.update = function (id, data) {
            return $http.patch('/api/v1/po/' + id + '/', data);
        };
        factory.delete = function (id) {
            return $http.delete('/api/v1/po/' + id + '/');
        };


        factory.getPOItems = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-items/', {
                params: params,
            });
        };
        factory.deletePOItems = function(id){
            return $http.delete('/api/v1/po-items/'+id+'/');
        };
        factory.getOneItem = function (id) {
            if (id) {
                return $http.get('/api/v1/po-items/' + id);
            }
        };
        factory.postPOItems = function (data) {
            return $http.post('/api/v1/po-items/', data);
        };
        factory.updatePOItems = function (id, data) {
            return $http.patch('/api/v1/po-items/' + id + '/', data);
        };


        factory.getReferences = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-references/', {
                params: params,
            });
        };
        factory.getOneReference = function (id) {
            if (id) {
                return $http.get('/api/v1/po-references/' + id);
            }
        };
        factory.postReferences = function (data) {
            return $http.post('/api/v1/po-references/', data);
        };
        factory.updateReferences = function (id, data) {
            return $http.patch('/api/v1/po-references/' + id + '/', data);
        };

        factory.getScopeOfWork = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-sow/', {
                params: params,
            });
        };


        factory.getOneScopeOfWork = function (id) {
            if (id) {
                return $http.get('/api/v1/po-sow/' + id);
            }
        };
        factory.postScopeOfWork = function (data) {
            return $http.post('/api/v1/po-sow/', data);
        };
        factory.updateScopeOfWork = function (id, data) {
            return $http.patch('/api/v1/po-sow/' + id + '/', data);
        };


        factory.getPriceBasis = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-price-basis/', {
                params: params,
            });
        };
        factory.getOnePriceBasis = function (id) {
            if (id) {
                return $http.get('/api/v1/po-price-basis/' + id);
            }
        };
        factory.postPriceBasis = function (data) {
            return $http.post('/api/v1/po-price-basis/', data);
        };
        factory.updatePriceBasis = function (id, data) {
            return $http.patch('/api/v1/po-price-basis/' + id + '/', data);
        };


        factory.getPaymentTerms = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-payment-terms/', {
                params: params,
            });
        };
        factory.getOnePaymentTerm = function (id) {
            if (id) {
                return $http.get('/api/v1/po-payment-terms/' + id);
            }
        };
        factory.postPaymentTerms = function (data) {
            return $http.post('/api/v1/po-payment-terms/', data);
        };
        factory.updatePaymentTerms = function (id, data) {
            return $http.patch('/api/v1/po-payment-terms/' + id + '/', data);
        };


        factory.getLiquidatedDamages = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-liquidated-damages/', {
                params: params,
            });
        };
        factory.getOneLiquidatedDamage = function (id) {
            if (id) {
                return $http.get('/api/v1/po-liquidated-damages/' + id);
            }
        };
        factory.postLiquidatedDamages = function (data) {
            return $http.post('/api/v1/po-liquidated-damages/', data);
        };
        factory.updateLiquidatedDamages = function (id, data) {
            return $http.patch('/api/v1/po-liquidated-damages/' + id + '/', data);
        };


        factory.getDeliveryTerms = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-delivery-terms/', {
                params: params,
            });
        };
        factory.getOneDeliveryTerm = function (id) {
            if (id) {
                return $http.get('/api/v1/po-delivery-terms/' + id);
            }
        };
        factory.postDeliveryTerms = function (data) {
            return $http.post('/api/v1/po-delivery-terms/', data);
        };
        factory.updateDeliveryTerms = function (id, data) {
            return $http.patch('/api/v1/po-delivery-terms/' + id + '/', data);
        };


        factory.getShippingAddress = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-shipping-address/', {
                params: params,
            });
        };
        factory.getOneShippingAddress = function (id) {
            if (id) {
                return $http.get('/api/v1/po-shipping-address/' + id);
            }
        };
        factory.postShippingAddress = function (data) {
            return $http.post('/api/v1/po-shipping-address/', data);
        };
        factory.updateShippingAddress = function (id, data) {
            return $http.patch('/api/v1/po-shipping-address/' + id + '/', data);
        };


        factory.getBankGuarantee = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-bank-guarantee/', {
                params: params,
            });
        };
        factory.getOneBankGuarantee = function (id) {
            if (id) {
                return $http.get('/api/v1/po-bank-guarantee/' + id);
            }
        };
        factory.postBankGuarantee = function (data) {
            return $http.post('/api/v1/po-bank-guarantee/', data);
        };
        factory.updateBankGuarantee = function (id, data) {
            return $http.patch('/api/v1/po-bank-guarantee/' + id + '/', data);
        };


        factory.getGeneralTNC = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-general-tnc/', {
                params: params,
            });
        };
        factory.getOneGeneralTNC = function (id) {
            if (id) {
                return $http.get('/api/v1/po-general-tnc/' + id);
            }
        };
        factory.postGeneralTNC = function (data) {
            return $http.post('/api/v1/po-general-tnc/', data);
        };
        factory.updateGeneralTNC = function (id, data) {
            return $http.patch('/api/v1/po-general-tnc/' + id + '/', data);
        };


        factory.getOtherTerms = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-other-terms/', {
                params: params,
            });
        };
        factory.getOneOtherTerm = function (id) {
            if (id) {
                return $http.get('/api/v1/po-other-terms/' + id);
            }
        };
        factory.postOtherTerms = function (data) {
            return $http.post('/api/v1/po-other-terms/', data);
        };
        factory.updateOtherTerms = function (id, data) {
            return $http.patch('/api/v1/po-other-terms/' + id + '/', data);
        };


        factory.getContactPerson = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-contact-person/', {
                params: params,
            });
        };
        factory.getOneContactPerson = function (id) {
            if (id) {
                return $http.get('/api/v1/po-contact-person/' + id);
            }
        };
        factory.postContactPerson = function (data) {
            return $http.post('/api/v1/po-contact-person/', data);
        };
        factory.updateContactPerson = function (id, data) {
            return $http.patch('/api/v1/po-contact-person/' + id + '/', data);
        };


        factory.getPOType = function () {
            return $http.get('/api/v1/po-types/');
        };


        factory.getOnePaymentInstallments = function (id) {
            if (id) {
                return $http.get('/api/v1/po-payment-terms-installments/' + id);
            }
        };
        factory.deletePaymentInstallments = function (id) {
            if (id) {
                return $http.delete('/api/v1/po-payment-terms-installments/' + id);
            }
        };
        factory.postPaymentInstallments = function (data) {
            return $http.post('/api/v1/po-payment-terms-installments/', data);
        };
        factory.getPaymentInstallments = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/po-payment-terms-installments/', {
                params: params,
            });
        };
        factory.updatePaymentInstallments = function (id, data) {
            return $http.patch('/api/v1/po-payment-terms-installments/' + id + '/', data);
        };

        
        factory.getSupplyTypes = function(){
            return $http.get('/api/v1/po-supply-types/');
        };

        factory.getPOStatus = function(){
            return $http.get('/api/v1/po-status/');
        };

        //GRN
        factory.getGRN = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/grn/', {
                params: params
            });
        };
        factory.getOneGRN = function (id) {
            if (id) {
                return $http.get('/api/v1/grn/' + id);
            }
        };
        factory.postGRN = function (data) {
            return $http.post('/api/v1/grn/', data);
        };
        factory.updateGRN = function (id, data) {
            return $http.patch('/api/v1/grn/' + id + '/', data);
        };
        factory.deleteGRN = function (id) {
            return $http.delete('/api/v1/grn/' + id + '/');
        };

        //GRN-Items
        factory.getGRNItems = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/grn-items/', {
                params: params
            });
        };
        factory.getOneGRNItem = function (id) {
            if (id) {
                return $http.get('/api/v1/grn-items/' + id);
            }
        };
        factory.postGRNItem = function (data) {
            return $http.post('/api/v1/grn-items/', data);
        };
        factory.updateGRNItem = function (id, data) {
            return $http.patch('/api/v1/grn-items/' + id + '/', data);
        };
        factory.deleteGRNItem = function (id) {
            return $http.delete('/api/v1/grn-items/' + id + '/');
        };
        factory.getIMINStatus = function () {
            return $http.get('/api/v1/imin-status/');
        };

        //payment-request
        factory.getPaymentRequest = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/payment-request/', {
                params: params
            });
        };
        factory.getOnePaymentRequest = function (id) {
            if (id) {
                return $http.get('/api/v1/payment-request/' + id);
            }
        };
        factory.postPaymentRequest = function (data) {
            return $http.post('/api/v1/payment-request/', data);
        };
        factory.updatePaymentRequest = function (id, data) {
            return $http.patch('/api/v1/payment-request/' + id + '/', data);
        };
        factory.deletePaymentRequest = function (id) {
            return $http.delete('/api/v1/payment-request/' + id + '/');
        };
        
        //PaymentRequest-Items
        factory.getPaymentRequestItems = function (params) {
            if (!params) {
                params = {};
            }
            return $http.get('/api/v1/payment-request-items/', {
                params: params
            });
        };
        factory.getOnePaymentRequestItem = function (id) {
            if (id) {
                return $http.get('/api/v1/payment-request-items/' + id);
            }
        };
        factory.postPaymentRequestItem = function (data) {
            return $http.post('/api/v1/payment-request-items/', data);
        };
        factory.updatePaymentRequestItem = function (id, data) {
            return $http.patch('/api/v1/payment-request-items/' + id + '/', data);
        };
        factory.deletePaymentRequestItem = function (id) {
            return $http.delete('/api/v1/payment-request-items/' + id + '/');
        };

        
        factory.getPaymentStatus = function () {
            return $http.get('/api/v1/payment-status/');
        };

        factory.getProjectValue = function(params) {
            return $http.get('/api/v1/po-projects-value/', {
                params: params,
            });
        };

        factory.getSupplierValue = function(params) {
            return $http.get('/api/v1/po-suppliers-value/', {
                params: params,
            });
        };

        factory.getBuyerValues = function(params) {
            return $http.get('/api/v1/po-buyer-value/', {
                params: params,
            });
        };

        return factory;
    }]);

})();