const GoogleStrategy = require("passport-google-oauth20").Strategy
const mongoose = require("mongoose")
const User = require("../models/user.model")

module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
           
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            } else {
                user = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    avatar: profile.photos[0].value,
                    fullname: profile.displayName,
                    email: profile.emails[0].value,
                    password: '', 
                    phone: '', 
                    roles: [], 
                    isVerified: true, 
                });

                await user.save();
                return done(null, user);
            }
        } catch (err) {
            console.error(err);
            return done(err, null);
        }
    }))
    
    passport.serializeUser((user, done) => {
        done(null, user.id)
    }) 
    
        passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}