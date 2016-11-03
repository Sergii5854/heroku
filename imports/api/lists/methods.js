import {Meteor} from "meteor/meteor";
import {FlowRouter} from "meteor/kadira:flow-router";
import {Dictionaries, Words} from "../models";
import {check} from "meteor/check";

Meteor.methods({
    'user.create'(user){
        check(user, {
            username: String,
            email: String,
            password: String
        });
        if (Accounts.findUserByEmail(user.email)) {
            console.log("This email exist")
        } else {
            Accounts.createUser({
                username: user.username,
                email: user.email,
                password: user.password
            });
        }
    },

    'user.changeUsername'(username) {
        check(username, String);
        if (this.userId) {
            Accounts.setUsername(this.userId, username)
        }
    },

    'user.changeEmail'(email) {
        check(email, String);
        if (this.userId) {
            let currentUserEmail = Meteor.user().emails[0];
            Accounts.removeEmail(this.userId, currentUserEmail);
            Accounts.addEmail(this.userId, email);
        }
    },

    'user.saveAvatar'(imageBase64Url) {
        check(imageBase64Url, String);
        if (this.userId) {
            Meteor.users.update({_id: this.userId}, {
                $set: {
                    avatarUrl: imageBase64Url
                }
            }, (err, doc) => {
                if (err) {
                    Meteor.Error(err);
                } else {
                    console.log(doc);
                }
            })
        }
    },

    'dictionary.create'(title, isPublic) {
        check(title, String);
        check(isPublic, Boolean);
        let dictionary = {
            title,
            isPublic,
            wordCount: 0,
            owner: Meteor.userId(),
            words: []
        };
        Dictionaries.insert(dictionary, (err, doc) => {
            if (err) {
                Meteor.Error(err);
            }
        })
    },

    'delete.dictionary'(id){
        check(id, String);
        if (this.userId) {
            Dictionaries.remove(id, (err, doc) => {
                if (err) {
                    Meteor.Error(err);
                } else {
                    console.log(`Document ${doc} was removed`)
                }
            })
        }
    },

    'dictionary.update'(id, modifier){
        check(id, String);
        check(modifier, Object);
        if (this.userId) {
            Dictionaries.update({_id: id}, {
                    $set: modifier
                },
                (err, doc) => {
                    if (err) {
                        Meteor.Error(err);
                    } else {
                        console.log(`${doc} document was updated`)
                    }
                })
        }
    },

    'word.save'(word) {
        check(word, {
            dictionaryId: String,
            spell: String,
            transcription: String,
            translation: String,
            context: Match.Maybe(String),
            checked: Boolean
        });
        if (this.userId) {
            word.userId = this.userId;
            Words.insert(word, (err, doc) => {
                if (err) {
                    Meteor.Error(err);
                }
            })
        }
    },

    'word.delete'(id){
        check(id, String);
        Words.remove({_id: id}, (err, doc) => {
            if (err) {
                Meteor.Error(err);
            }
        })
    },

    'word.setChecked'(id, setChecked){
        check(id, String);
        check(setChecked, Boolean);

        Words.update({_id: id}, {
            $set: {
                checked: setChecked
            }
        }, (err, doc)=> {
            if (err) {
                Meteor.Error(err);
            } else {
                console.log(`${doc} doc was updated`)
            }
        });
    }
});