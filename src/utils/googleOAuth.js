import axios from 'axios';

async function exchangeCodeForTokens(code) {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BACKEND_URL}/auth/google-callback`,
    });

    const { data } = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return data; // contains access_token + id_token
}

async function getGoogleUserInfo(accessToken) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return data;
}

export async function getGoogleUserFromCode(code) {
    // Step 1: exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Step 2: get user info
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    return {
        googleUser,
        tokens,
    };
}
