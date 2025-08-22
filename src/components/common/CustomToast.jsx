import React from 'react';
import { notification } from "antd"

// export const CustomToast = (state, message, description, duration = 3) => {
//     const notificationInstance = notification[state]({
//         message: message,
//         description: description,
//         placement: 'topRight',
//         duration: duration,
//         // onClick: () => {
//         //     // notificationInstance.close();
//         // },
//     });
// }

export const CustomToast = {
    success: (message, description, duration = 3) => {
        notification.success({
            message: message,
            description: description,
            placement: 'topRight',
            duration: duration,
        });
    },
    warning: (message, description, duration = 3) => {
        notification.warning({
            message: message,
            description: description,
            placement: 'topRight',
            duration: duration,
        });
    },
    info: (message, description, duration = 3) => {
        notification.info({
            message: message,
            description: description,
            placement: 'topRight',
            duration: duration,
        });
    },
    error: (message, description, duration = 3) => {
        notification.error({
            message: message,
            description: description,
            placement: 'topRight',
            duration: duration,
        });
    },
}