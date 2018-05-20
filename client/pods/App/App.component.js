// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Navbar } from 'reactstrap';

import LayoutBox from 'components/LayoutBox';

import { Link } from 'found';

import styles from './App.scss';

import Header from '../Header/Header.component';
import Footer from '../Footer/Footer.container';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import Rxmq from 'rxmq';

import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    Rxmq.channel('invoke.action').observe('configure')
      .subscribe(
        (data) => {
          this.setState({
            invokeAction: data.action,
            invokeContext: data.context
          });
        },
        (error) => {
          // handle error ...
        }
      );

    Rxmq.channel('invoke.action').observe('start')
      .subscribe(
        (data) => {
          NotificationManager.success(
            `${data.action.groupName} / ${data.action.title} on entity ${data.action.entityType}:${data.context}`,
            'Invoking Action',
            5000
          );
        },
        (error) => {
          // handle error ...
        }
      );
  }

  closeModal = () => {
    this.setState({
      invokeAction: null,
      invokeContext: null
    });
  }

  invokeAction = () => {
    Rxmq.channel('invoke.action').subject('start').next({
      action: this.state.invokeAction,
      context: this.state.invokeContext,
      params: {}
    });

    this.setState({
      invokeAction: null,
      invokeContext: null
    });
  }

  render() {
    let routeTitle = '';
    const { invokeAction } = this.state;

    if (this.props.routes) {
      routeTitle = this.props.routes[this.props.routes.length - 1].title;
    }

    const routes = this.props.routes.filter((item) => item.title);
    let pathPrepend = '';

    return (
      <div className='all-wrapper solid-bg-all with-side-panel' style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <LayoutBox
          fit='true'
          column='true'
        >
          <Header
            {...this.props}
          />

          {routes && routes.length > 1 && (
            <LayoutBox>
              <ul className='breadcrumb'>
                {routes.map((route) => {
                  const routePath = `${pathPrepend}${route.path}`;

                  const item = (
                    <li className='breadcrumb-item' key={routePath}>
                      <Link to={routePath}>{route.title}</Link>
                    </li>
                  );

                  pathPrepend = route.path;

                  return item;
                })}
              </ul>
            </LayoutBox>
          )}

          <LayoutBox flex={1}>
            {this.props.children}
          </LayoutBox>

          <LayoutBox>
            <Footer />
          </LayoutBox>

          {invokeAction && invokeAction.params && (
            <Modal isOpen={this.state.invokeAction} toggle={this.closeModal}>
              <ModalHeader toggle={this.closeModal}>Invoke Actions</ModalHeader>

              <ModalBody>
                <Form>
                  {invokeAction.params.map((param) => {
                    if (param.type === 'option') {
                      return (
                        <div>
                          {param.title}:<br />

                          <FormGroup check inline>
                            {param.values.map((value, index) => (
                              <Label check key={index}>
                                <Input type='radio' name={param.name} />&nbsp;&nbsp;
                                {value.value}
                              </Label>
                            ))}
                          </FormGroup>
                        </div>
                      );
                    }

                    if (param.type === 'text') {
                      return (
                        <FormGroup>
                          <Label>{param.title}:</Label>
                          <Input type='textarea' name={param.name} value={param.default} placeholder={param.title} />
                        </FormGroup>
                      );
                    }

                    if (param.type === 'int') {
                      return (
                        <FormGroup>
                          <Label>{param.title}:</Label>
                          <Input type='number' name={param.name} value={param.default} placeholder={param.title} />
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup>
                        <Label>{param.title}:</Label>
                        <Input type='text' name={param.name} value={param.default} placeholder={param.title} />
                      </FormGroup>
                    );
                  })}
                </Form>
              </ModalBody>

              <ModalFooter>
                <Button color='primary' onClick={this.invokeAction}>Invoke</Button>{' '}
                <Button color='secondary' onClick={this.closeModal}>Cancel</Button>
              </ModalFooter>
            </Modal>
          )}
        </LayoutBox>

        <NotificationContainer />
      </div>
    );
  }
}
