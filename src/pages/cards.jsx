import React from 'react'
import {graphql} from 'gatsby'
export default function Cards({data}) {
  return (
    <>
    <h2>title:  {data.site.siteMetadata.title}</h2>
    <div>Cards</div>
    </>

  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
