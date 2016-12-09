import {Meteor} from "meteor/meteor";
import React, {Component} from "react";
import {Col, Button, Panel, Form, FormGroup, ControlLabel} from "react-bootstrap";
import {createContainer} from "meteor/react-meteor-data";
import {Dictionaries, Words} from "../../../api/models";

class Quiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questionIndex: 0,
            msg: '',
            correctAnswer: '',
            correctAnswersCount: 0,
            wrongAnswersCount: 0,
            
        }
    }

    checkAnswer() {
        let index = this.state.questionIndex,
            words = this.props.words,
            answer = this.refs.answer.value.trim().toLowerCase();
        if (answer === words[index].spell) {
            this.setState({
                msg: "Correct answer",
                correctAnswersCount: this.state.correctAnswersCount + 1,

            });
        }
        else {
            this.setState({
                msg: "Wrong answer",
                correctAnswer: words[index].spell,
                wrongAnswersCount: this.state.wrongAnswersCount + 1,
            });
        }
    }

    nextWord() {
        this.setState({
            questionIndex: this.state.questionIndex + 1,
            msg: '',
            correctAnswer: '',
            context: '',
        });
    }

    renderQuizWords() {
        let index = this.state.questionIndex,
            words = this.props.words,
            context = this.state.context;

        if (index < words.length) {
            return (
                <Form inline>
                    <FormGroup controlId="formInlineEmail">
                        <ControlLabel>{words[index].translation}</ControlLabel>
                        {' - '}
                        <input className="form-control" type="text" ref="answer" placeholder="Write translation"/>
                    <span>{this.state.context}</span> 
                    </FormGroup>

                    <Button onClick={this.checkAnswer.bind(this)}>
                        Check
                    </Button>

                    <Button onmouseover={this.checkAnswer.bind(this)} onClick={this.nextWord.bind(this)}>
                        Next
                    </Button>
                    
                    <span>{this.state.msg + ' '}</span>
                    <span>{this.state.correctAnswer}</span> 
                    <h1>{this.state.context}</h1>
                    
                     <span>{words[index].context}</span>
              
                                     
                </Form>

            

            )
        } else {
            return (
                <Col lg={6}>
                    <h1>You have {this.state.correctAnswersCount} correct answers and {this.state.wrongAnswersCount}
                         wrong</h1>
                </Col>
            )
        }

    }

    render() {
        if (this.props.isLoading) {

            return (
                <Panel header="Quiz">
                    {this.renderQuizWords()}
                </Panel>
            )
        } else {
            return (<div><h1>Loading...</h1></div>)
        }

    }
}

export default createContainer(({id}) => {
    let wordsSub = Meteor.subscribe("words", id).ready(),
        dictionarySub = Meteor.subscribe("dictionary", id).ready();
    return {
        isLoading: wordsSub && dictionarySub,
        dictionary: Dictionaries.findOne(),
        words: Words.find({cheked: false}).fetch().sort(f=>.5 -Math.random())
    }

}, Quiz)