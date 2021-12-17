
const accessToken = "2BXxL6w674uw8WYJagRluKrqpB_kSL2hP3czCI1LA64"
const spaceId = "vmz4lv5fgrcj"
const query = `{
  teamMemberCollection {
    items {
      name
      profilePicture {
        url
      }
      description
    }
  }
}`

export { accessToken, spaceId, query}