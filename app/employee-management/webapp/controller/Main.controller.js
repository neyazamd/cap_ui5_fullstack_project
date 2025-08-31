sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("com.company.employeemanagement.controller.Main", {
        onInit: function () {

        },

        onNavigateToEmployees: function () {
            MessageToast.show("Employee Management - Navigation coming soon");
        },

        onNavigateToDepartments: function () {
            MessageToast.show("Department Management - Navigation coming soon");
        },

        onNavigateToLeaveRequests: function () {
            MessageToast.show("Leave Management - Navigation coming soon");
        },

        onNavigateToPerformance: function () {
            MessageToast.show("Performance Management - Navigation coming soon");
        }
    });
});
