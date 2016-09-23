/**
 * Created by Ahmet on 08.06.2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:adminWorkshopManagementCtrl
 * @description Shows a list of past and future workshops
 * @requires restSvcs.AdminWorkshop
 */
mainAppCtrls.controller('adminWorkshopManagementCtrl', ['$scope', 'AdminWorkshop', '$alert', '$translate',
    function ($scope, AdminWorkshop, $alert, $translate) {

        //Define object to store the alert in
        $scope.myAlert;
        $scope.currentList = [];
        $scope.elapsedList = [];

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOP_DELETE_SUCCESS',
            'ALERT_INTERNAL_SERVER_ERROR', 'ALERT_WORKSHOP_DELETE_FAIL']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopManagementCtrl#compareToCurrent
         * @params {Date} a Date to compare to current Date
         * @methodOf mainAppCtrls.controller:adminWorkshopManagementCtrl
         * @description Compares the give date to the current date
         * @returns {boolean} Returns true if passed date lies in the future
         **/
        var compareToCurrent = function (a) {
            var d1 = new Date();
            var d2 = new Date(a);
            return (d2.getTime() > d1.getTime())
        };
        //Get and store translation for alert title.
        $translate(['TITLE_ERROR', 'ERROR_NO_WORKSHOPS', 'EMPTY_WORKSHOP', 'TITLE_SUCCESS']).then(function (translations) {
            $scope.errorTitle = translations.TITLE_ERROR;
            $scope.errorMsg = translations.ERROR_NO_WORKSHOPS;
            $scope.successTitle = translations.TITLE_SUCCESS;
            $scope.emptyMsg = translations.EMPTY_WORKSHOP;
        });
        var loadWorkshops = function () {
            $scope.loading = true;
            AdminWorkshop.gethistory().$promise.then(function (value) {
                var workshopList = value;
                $scope.currentList = [];
                $scope.elapsedList = [];
                $scope.loading = false;
                for (var i = 0; i < workshopList.length; i++) {
                    if (compareToCurrent(workshopList[i].start_at))
                        $scope.currentList.push(workshopList[i]);
                    else
                        $scope.elapsedList.push(workshopList[i]);
                }
            }, function (httpResponse) {
                //switch through all possible errors
                switch (httpResponse.status) {
                    case 204:
                        $scope.myAlert = $alert({
                            title: $scope.errorTitle,
                            type: 'danger',
                            content: $scope.emptyMsg,
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                    //Alert for error 404, no workshops available
                    case 404:
                        $scope.myAlert = $alert({

                            title: $scope.errorTitle,
                            type: 'danger',
                            content: $scope.errorMsg,
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                    case 500:
                        $scope.myAlert = $alert({
                            title: $scope.errorTitle,
                            type: 'danger',
                            content: _translations.ALERT_INTERNAL_SERVER_ERROR + ' (' + httpResponse.status + ')',
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                }
                $scope.loading = false;
            });
        };
        loadWorkshops();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopManagementCtrl#delete
         * @methodOf mainAppCtrls.controller:adminWorkshopManagementCtrl
         * @description Function removes a single Workshop from the list
         * @params {number} _id workshop id, which should be removed
         */
        $scope.delete = function (_id) {
            AdminWorkshop.delete({id: _id}).$promise.then(function (httpResponse) {
                    $alert({
                        title: $scope.successTitle,
                        type: 'success',
                        container: '#alert',
                        show: true,
                        dismissable: true,
                        content: _translations.ALERT_WORKSHOP_DELETE_SUCCESS,
                        duration: 20
                    });
                    loadWorkshops();
                }
                , function (httpResponse) {
                    $alert({
                        title: $scope.errorTitle,
                        type: 'danger',
                        container: '#alert',
                        show: true,
                        dismissable: true,
                        content: _translations.ALERT_WORKSHOP_DELETE_FAIL + ' (' + httpResponse.status + ')',
                        duration: 20
                    });
                }
            )

        }

    }
]);