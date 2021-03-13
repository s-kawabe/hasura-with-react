import React from 'react'
import { Data } from '../App';
import { List, ListItem, ListIcon } from "@chakra-ui/react"
import { AiOutlineCheck } from "react-icons/ai";

type Props = {
  data: Data
}

const TodoToast: React.VFC<Props> = ({ data }) => {
  return (
    <List spacing="3" display="flex" flexDirection="column" justifyContent="flex-start">
      {data.users.map((user) => (
        <ListItem key={user.id}>
          <ListIcon as={AiOutlineCheck} color="teal.200"/>
          {user.id}: {user.name}
        </ListItem>
      ))}
    </List>
  )
}

export { TodoToast }