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
            owner: Meteor.userId(),
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
            let ownerId = Dictionaries.findOne({_id: id}).ownerId;
            if(this.userId === ownerId) {
                Dictionaries.remove(id, (err, doc) => {
                    if (err) {
                        Meteor.Error(err);
                    } else {
                        console.log(`Document ${doc} was removed`)
                    }
                })
            } else {
                console.log('access denied')
            }
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

    'word.save'(word, synonyms) {
        check(word, {
            dictionaryId: String,
            spell: String,
            transcription: String,
            translation: String,
            context: Match.Maybe(String),
            
        });

        check(synonyms, Array);
        if (this.userId) {
            word.userId = this.userId;
            let synonymsWithId = [];

            Words.find({spell: {$in: synonyms}}).forEach((item) => {
                synonymsWithId.push({
                    _id: item._id,
                    spell: item.spell,
                    context: item.context,
                })
            });
            word.synonyms = synonymsWithId || [];
            Words.insert(word, (err, doc) => {
                if (err) {
                    Meteor.Error(err);
                }
            })
        }
    },

    'word.delete'(id){
        check(id, String);
        if (this.userId) {
            let ownerId = Words.findOne({_id: id}).userId;
            if(this.userId === ownerId) {
                Words.remove({_id: id}, (err, doc) => {
                    if (err) {
                        Meteor.Error(err);
                    }
                })
            } else {
                Meteor.Error('access denied')
            }

        }
    },

    'word.update'(id, modifier){
        check(id, String);
        check(modifier, Object);

        Words.update({_id: id}, {$set: modifier}, (err, doc) => {
            if (err) {
                Meteor.Error(err);
            } else {
                console.log(`${doc} doc was updated`)
            }
        });
    },


    'word.search'(searchValue){
        check(searchValue, String);
        return Words.find({spell: {$regex: searchValue, $options: "x"}}, {
            fields: {
                spell: 1
            },
            limit: 5,
        }).fetch()
    },

    'word.importFromCsv'(csv, dictionaryId) {
        let Converter = require("csvtojson").Converter,
            csvConverter = new Converter();

        csvConverter.on("end_parsed", Meteor.bindEnvironment((jsonObj) => {
            console.log(jsonObj);
                jsonObj.forEach((word) => {
                    word.dictionaryId = dictionaryId;
                    Meteor.call('word.save', word, [])
                });
                console.log("Finished parsing");
            })
        );
        csvConverter.fromString(csv, function (err, jsonObj) {
            if (err) {
                Meteor.Error(err)
                console.log("ERR ");
            }
        });
    }

});
