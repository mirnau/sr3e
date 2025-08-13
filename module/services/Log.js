export default class Log {
    static error(message, location, obj) {
        this._print('❌', 'coral', message, location, obj);
    }

    static warn(message, location, obj) {
        this._print('⚠️', 'orange', message, location, obj);
    }

    static info(message, location, obj) {
        this._print('ℹ️', 'lightblue', message, location, obj);
    }

    static success(message, location, obj) {
        this._print('✅', 'lightgreen', message, location, obj);
    }

    static inspect(message, location, obj) {
        this._print('🔎', 'mediumpurple', message, location, obj);
    }

    static _print(icon, color, message, location, obj) {
        const iconStyle = `font-weight: bold; color: ${color};`;
        const sr3eStyle = `font-weight: bold; color: ${color};`;
        const msgStyle = 'color: orange;';
        const locationStyle = `font-weight: bold; color: ${color};`;
        
        // Handle different location formats
        if (typeof location === 'string') {
            if (obj !== undefined) {
                console.log(
                    `%c${icon} | %csr3e | %c${message} in %c${location}`,
                    iconStyle,
                    sr3eStyle,
                    msgStyle,
                    locationStyle,
                    obj
                );
            } else {
                console.log(
                    `%c${icon} | %csr3e | %c${message} in %c${location}`,
                    iconStyle,
                    sr3eStyle,
                    msgStyle,
                    locationStyle
                );
            }
        } else if (location && typeof location === 'object') {
            const fileStyle = `font-weight: bold; color: ${color};`;
            const classStyle = 'font-weight: bold; color: #16a379ff;';
            const methodStyle = 'font-weight: bold; color: #FADA5E;'; // naples yellow
            const lineStyle = 'font-weight: bold; color: #a0b6e4ff;'; // coral blue (dark slate blue)
            
            let logFormat = `%c${icon} | %csr3e | %c${message} in `;
            const logStyles = [iconStyle, sr3eStyle, msgStyle];
            
            if (location.file) {
                logFormat += `%c${location.file}`;
                logStyles.push(fileStyle);
                if (location.class || location.method || location.line) logFormat += ' ';
            }
            
            if (location.class) {
                logFormat += `%c${location.class}`;
                logStyles.push(classStyle);
                if (location.method || location.line) logFormat += ' ';
            }
            
            if (location.method) {
                logFormat += `%c${location.method}`;
                logStyles.push(methodStyle);
                if (location.line) logFormat += ' ';
            }
            
            if (location.line) {
                logFormat += `%cL${location.line}`;
                logStyles.push(lineStyle);
            }
            
            if (obj !== undefined) {
                console.log(logFormat, ...logStyles, obj);
            } else {
                console.log(logFormat, ...logStyles);
            }
        } else {
            const unknownText = 'unknown';
            if (obj !== undefined) {
                console.log(
                    `%c${icon} | %csr3e | %c${message} in %c${unknownText}`,
                    iconStyle,
                    sr3eStyle,
                    msgStyle,
                    locationStyle,
                    obj
                );
            } else {
                console.log(
                    `%c${icon} | %csr3e | %c${message} in %c${unknownText}`,
                    iconStyle,
                    sr3eStyle,
                    msgStyle,
                    locationStyle
                );
            }
        }
    }
}