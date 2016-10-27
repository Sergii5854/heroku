import { Meteor } from 'meteor/meteor'
import React, {Component, PropTypes} from "react";
import {FormControl, Col, Button, Panel, Row} from "react-bootstrap";
import {createContainer} from "meteor/react-meteor-data";
let moment  = require('moment');

import {Dictionaries} from '../../api/models'

class UserCards extends Component {
    renderDictionariesCard() {
        let dictionaries = this.props.dictionaries;
        let user  = this.props.user;
        return dictionaries.map((dictionary) => {
            return (
                <Col lg={5} key={dictionary._id}>
                    <div className="card">
                        <Col lg={10}>
                            <h4><a href={"/user/" + user._id + "/view/" + dictionary._id}>{dictionary.title}</a></h4>
                            <span>{moment(dictionary.createdAt).format('l')}</span>
                        </Col>
                    </div>
                </Col>
            )
        })
    }

    render() {
        return(
            <Panel header={this.props.user.username + " dictionaries"}>
                <Row>
                    {this.renderDictionariesCard()}
                </Row>
            </Panel>
        )
    }
}

export default UserCardsContainer = createContainer(({id}) => {
    Meteor.subscribe('dictionaries');
    Meteor.subscribe('users');
    return {
        dictionaries: Dictionaries.find({owner: id}).fetch(),
        user: Meteor.users.findOne({_id: id}) || {},
    }
}, UserCards);