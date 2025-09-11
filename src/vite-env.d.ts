/// <reference types="vite/client" />

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        themeParams?: {
          bg_color?: string;
          bgColor?: string;
          text_color?: string;
          textColor?: string;
          hint_color?: string;
          hintColor?: string;
          link_color?: string;
          linkColor?: string;
          button_color?: string;
          buttonColor?: string;
          button_text_color?: string;
          buttonTextColor?: string;
        };
        MainButton: {
          text: string;
          color?: string;
          textColor?: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback?: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback?: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback?: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        onEvent: (eventType: string, eventHandler: (event: any) => void) => void;
        offEvent: (eventType: string, eventHandler: (event: any) => void) => void;
        sendData: (data: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: {
          text?: string;
        }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (data: string) => void) => void;
        requestWriteAccess: (callback?: (access: boolean) => void) => void;
        requestContact: (callback?: (contact: {
          phone_number: string;
          first_name: string;
          last_name?: string;
          user_id?: number;
          vcard?: string;
        }) => void) => void;
        invokeCustomMethod: (method: string, params?: any, callback?: (result: any) => void) => void;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          bgColor?: string;
          text_color?: string;
          textColor?: string;
          hint_color?: string;
          hintColor?: string;
          link_color?: string;
          linkColor?: string;
          button_color?: string;
          buttonColor?: string;
          button_text_color?: string;
          buttonTextColor?: string;
        };
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          receiver?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: 'group' | 'supergroup' | 'channel';
            title: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date?: number;
          hash?: string;
        };
        isVersionAtLeast: (version: string) => boolean;
        setViewport: (params: {
          height?: number;
          is_expanded?: boolean;
          stable_height?: number;
        }) => void;
        onViewportChanged: (callback: (event: { isStateStable: boolean }) => void) => void;
        offViewportChanged: (callback: (event: { isStateStable: boolean }) => void) => void;
        onMainButtonClicked: (callback: () => void) => void;
        offMainButtonClicked: (callback: () => void) => void;
        onBackButtonClicked: (callback: () => void) => void;
        offBackButtonClicked: (callback: () => void) => void;
        onSettingsButtonClicked: (callback: () => void) => void;
        offSettingsButtonClicked: (callback: () => void) => void;
        onInvoiceClosed: (callback: (event: { url: string; status: string }) => void) => void;
        offInvoiceClosed: (callback: (event: { url: string; status: string }) => void) => void;
        onPopupClosed: (callback: (event: { button_id: string }) => void) => void;
        offPopupClosed: (callback: (event: { button_id: string }) => void) => void;
        onQrTextReceived: (callback: (event: { data: string }) => void) => void;
        offQrTextReceived: (callback: (event: { data: string }) => void) => void;
        onClipboardTextReceived: (callback: (event: { data: string }) => void) => void;
        offClipboardTextReceived: (callback: (event: { data: string }) => void) => void;
        onWriteAccessRequested: (callback: (event: { status: 'allowed' | 'denied' }) => void) => void;
        offWriteAccessRequested: (callback: (event: { status: 'allowed' | 'denied' }) => void) => void;
        onContactRequested: (callback: (event: {
          status: 'sent' | 'cancelled';
          contact?: {
            phone_number: string;
            first_name: string;
            last_name?: string;
            user_id?: number;
            vcard?: string;
          };
        }) => void) => void;
        offContactRequested: (callback: (event: {
          status: 'sent' | 'cancelled';
          contact?: {
            phone_number: string;
            first_name: string;
            last_name?: string;
            user_id?: number;
            vcard?: string;
          };
        }) => void) => void;
        onCustomMethodInvoked: (callback: (event: { req_id: string; result: any }) => void) => void;
        offCustomMethodInvoked: (callback: (event: { req_id: string; result: any }) => void) => void;
        onThemeChanged: (callback: (event: { theme_params: any }) => void) => void;
        offThemeChanged: (callback: (event: { theme_params: any }) => void) => void;
        onViewportChanged: (callback: (event: { isStateStable: boolean }) => void) => void;
        offViewportChanged: (callback: (event: { isStateStable: boolean }) => void) => void;
      };
    };
  }
}

export {};
