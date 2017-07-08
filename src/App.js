import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0
const DEFAULT_HPP = 100

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

// const isSearched = (searchTerm) =>
//   (item) =>
//     !searchTerm ||
//     !item.title ||
//       item.title.toLowerCase().includes(searchTerm.toLowerCase());

class Search extends Component {
  render() {
    const { value, onChange, onSubmit, children } = this.props
    return (
      <form onSubmit={onSubmit}>
        {children} <input
          type="text"
          value={value}
          onChange={onChange}
        />
      </form>
    )
  }
}

class Button extends Component {
  render() {
    const { onClick, className = '', children } = this.props
    return(
      <button
        className={className}
        onClick={onClick}
        type="button">
        {children}
      </button>
    )
  }
}

class Table extends Component {
  render() {
    const { list, onDismiss } = this.props
    return (
      <div className="table">
        {list.map((item) => {
          return (
            <div key={item.objectID} className="table-row">
              <span style={{ width: '40%'}}>
                <a href={item.href}>{item.title}</a>
              </span>
              <span style={{ width: '30%'}}>{item.author}</span>
              <span style={{ width: '10%'}}>{item.num_comments}</span>
              <span style={{ width: '10%'}}>{item.points}</span>
              <span style={{ width: '10%'}}>
                <Button
                  onClick={() => onDismiss(item.objectID)}
                  className="button-inline">
                  Dismiss
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    )
  }
}


class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
      page: DEFAULT_PAGE
    }

    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this)
    this.setSearchTopstories = this.setSearchTopstories.bind(this)
    this.onSearchSubmit = this.onSearchSubmit.bind(this)

    this.onDismiss = this.onDismiss.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
  }

  setSearchTopstories(result) {
    const { hits, page } = result;
    const oldHits = page !== 0
      ? this.state.result.hits
      : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({ result: { hits: updatedHits, page: page } })
  }

  fetchSearchTopstories(searchTerm, page){
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`

    fetch(url)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e)
  }

  componentDidMount() {
    const { searchTerm } = this.state
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({
      result: { ...this.state.result, hits: updatedHits }
    })
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value})
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
    event.preventDefault();
  }

  render() {
    const { searchTerm, result } = this.state
    const page = (result && result.page) || 0

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        { result &&
          <Table
            list={result.hits}
            onDismiss={this.onDismiss} />
        }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopstories(searchTerm, page+1)}>
            More
          </Button>
        </div>
      </div>

    );
  }
}

export default App;
