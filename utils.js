import { api as misskeyApi } from 'misskey-js';

const getDeviceType = () => {
    const ua = navigator.userAgent;
    const is = reg => reg.test(ua);
    const getOsName = () => {
        if (is(/Android/)) {
            return 'Android';
        } else if (is(/Linux/)) {
            return 'Linux';
        } else if (is(/Mac OS X/) && !is(/iPhone OS|CPU OS/)) {
            return 'macOS';
        } else if (is(/Windows/)) {
            return 'Windows';
        } else if (is(/iPhone|iPod/)) {
            return 'iOS';
        } else if (is(/iPad/)) {
            return 'iPadOS';
        } else if (is(/CrOS/)) {
            return 'ChromeOS';
        } else {
            return 'Unknown OS';
        }
    }
    const os = getOsName();
    const betweenText = (start, end) => new RegExp(`(${start})(.*?)(${end})`).exec(ua)[2];
    const getOsVersion = () => {
        switch (os) {
            case 'Android':
                return betweenText('Android ','[.;]');
            case 'macOS':
                return betweenText('Mac OS X ','[;)]').replace('_', '.');
            case 'Windows':
                const ntVersion = Number(betweenText('Windows NT ','[;)]'));
                switch (ntVersion) {
                    case 10.0:
                        return '10(11)';
                    case 6.3:
                        return '8.1';
                    case 6.2:
                        return '8';
                    case 6.1:
                        return '7';
                    case 6.0:
                        return 'Vista';

                    default:
                        if (ntVersion > 10.0) {
                            return '新規のバージョン';
                        } else if (ntVersion < 6.0) {
                            return '以前のバージョン';
                        } else {
                            return '未知のバージョン';
                        }
                }
            case 'iOS':
            case 'iPadOS':
                return betweenText('iPhone;? i?OS |CPU OS ',';? ').replace('_', '.');
            case 'ChromeOS':
                return betweenText('CrOS ',' ');

            default:
                return '';
        }
    }
    const osVersion = getOsVersion();
    const getBrowser = () => {
        if (is(/Edge|Edg/)) {
            return 'Edge';
        } else if (is(/Firefox|FxiOS/)) {
            return 'Firefox';
        } else if (is(/Chrome|CriOS/)) {
            return 'Chrome';
        } else if (is(/iPhone|iPad|iPod|Mac/) && is(/Safari/)) {
            return 'Safari';
        } else if (is(/iPad/)) {
            return 'iPadOS';
        } else {
            return 'Unknown Browser';
        }
    }
    const browser = getBrowser();
    return `${browser} on ${os} ${osVersion}`;
}

const goMiAuth = host => {
  const baseUrl = import.meta.env.BASE_URL;
  const sessionId = crypto.randomUUID();
  const miAuthUrl = new URL(`https://${host}/miauth/${sessionId}`);
  const miAuthParams = miAuthUrl.searchParams;
  const deviceType = getDeviceType();
  miAuthParams.append('name',`Misskey ファイルアップロードPWA via ${deviceType}`);
  const callbackUrl = new URL(`${location.origin}${baseUrl}callback`);
  callbackUrl.searchParams.append('host', host);
  miAuthParams.append('callback', callbackUrl.toString());
  miAuthParams.append('permission', 'write:drive');
  location.href = miAuthUrl.toString();
}

const saveToken = async () => {
    const params = new URLSearchParams(location.search);
    history.replaceState(null, null, '.');
    const sessionId = params.get('session');
    const host = params.get('host');
    if (!sessionId || !host) {
        return;
    }
    localStorage.setItem('MFUP:sendTo', `https://${host}`);
    const cli = new misskeyApi.APIClient({origin: `https://${host}`});
    await cli.request(`miauth/${sessionId}/check`, {})
      .then(data => {
        if (data.ok) {
          localStorage.setItem('MFUP:auth', data.token);
        }
      }).catch((e) => {
        console.log(`${host}\'s miauth/{session}/check could not load`);
        console.dir(e);
    });
}

export {goMiAuth, saveToken}