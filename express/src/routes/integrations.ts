import { Router } from "express";
import { GoogleAuthenticationService } from "../services/auth/google-auth.service";
import { randomBytes } from "crypto";
import session from "express-session";
import { DEC } from "../services/secman";
import { ServerResponse } from "../models/server-response";
import { findUser, findUserByGoogleCredentialState } from "../services/db/mongo-db.service";
import { User } from "../models/db/mongodb/user.model";

const SESSION_SECRET = DEC('U2FsdGVkX19c5yN1iUn0lmMLwGRs7TKQ6Haa21CFAu2HO0CSH2UkL6H7TrITG7+X/Gv551HVOHLV4LSYzRzmXxHP84wiJnRwL4Nih17/87fU5I1lwCw70n36g+d2Umd8DuXajvLbHyMAmF2ZG8Wh9RnCbDVXGs0IoxNSSPcmYMwv7nuVfMjfIIJWVno/Zm3++9uqEq0BeMl3mnKAKpW5CQ==');

const router = Router();

router.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
    }
}));

router.get('/google/auth-url', async (req, res) => {
    const user = await findUser(req.body.username as string);
    const state = randomBytes(32).toString('hex');
    if (!user.googleCredentials) {
        user.googleCredentials = {};
    }
    user.googleCredentials.state = state;
    await user.save();
    res.send(new ServerResponse(GoogleAuthenticationService.createAuthUrl(state)));
});

router.get('/google/auth-callback', async (req, res) => {
    const query = req.query;

    if (query.error) {
        res.send('<p>Failed to connect to Google.</p><a href="#" onclick="window.close();">close</a>');
        return;
    }

    const user = await findUserByGoogleCredentialState(query.state as string);
    
    if (user?.googleCredentials.state !== query.state) {
        console.error('State mismatch when trying to connect to Google. Possible CSRF attack');
        res.send('<p>Failed to connect to Google.</p><a href="#" onclick="window.close();">close</a>');
        return;
    }

    const tokens = await GoogleAuthenticationService.getTokens(query.code as string);

    user.googleCredentials = tokens;

    user.save();

    res.send('<p>Succesfully connected to Google.</p><a href="#" onclick="window.close();">close</a>');
});

module.exports = router;