import React, { Component } from "react";
import ReactDOM from "react-dom";
import { spaceId, accessToken, query } from "../lib/contentful";
class Team extends Component {
  constructor() {
    super();

    this.state = {
      team: [],
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    fetch(
      `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query
        })
      }
    )
      .then(res => res.json())
      .then(response => {
        console.log(response);

        const { data } = response;
        this.setState({
          loading: false,
          team: data ? data.teamMemberCollection.items : []
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error: error.message
        });
      });
  }

  render() {
    if (this.state.loading) {
      return "loading";
    }

    if (this.state.error) {
      return this.state.error;
    }
    
    if (!this.state.team.length) {
      return "no team defined";
    }

    const { team } = this.state;
    return (
      <div className="App">
        {team.map(team => {
          return (
            <div className="team" key={team.name}>
              {/* {team.cover && (
                <img
                  className="team__cover"
                  src={team.cover.url}
                  alt={team.cover.description}
                />
              )} */}
              <div className="team__container">
                <h2>{team.name}</h2>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Team
