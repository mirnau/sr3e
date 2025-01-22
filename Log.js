export default class Log {
    static error(message, sender, obj) {
        this._print('❌', 'red', message, sender, obj);
    }

    static warn(message, sender, obj) {
        this._print('⚠️', 'orange', message, sender, obj);
    }

    static info(message, sender, obj) {
        this._print('ℹ️', 'blue', message, sender, obj);
    }

    static success(message, sender, obj) {
        this._print('✅', 'lightgreen', message, sender, obj);
    }

    static inspect(message, sender, obj) {
        this._print('🔎', 'purple', message, sender, obj);
    }

    static _print(icon, color, message, sender, obj) {
        const iconStyle = `font-weight: bold; color: ${color};`;
        const sr3eStyle = `font-weight: bold; color: ${color};`;
        const msgStyle = 'color: orange;';
        const senderStyle = `font-weight: bold; color: ${color};`;

        if (obj !== undefined) {
            console.log(
                `%c${icon} | %csr3e | %c${message} in %c${sender}`,
                iconStyle,
                sr3eStyle,
                msgStyle,
                senderStyle,
                obj
            );
        } else {
            console.log(
                `%c${icon} | %csr3e | %c${message} in %c${sender}`,
                iconStyle,
                sr3eStyle,
                msgStyle,
                senderStyle
            );
        }
    }
}