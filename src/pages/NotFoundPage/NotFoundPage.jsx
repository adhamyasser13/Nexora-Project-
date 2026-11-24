import { Button } from '../../components/Button/Button.jsx'
import { StateMessage } from '../../components/StateMessage/StateMessage.jsx'

export function NotFoundPage() {
  return (
    <StateMessage
      title="Page not found"
      body="That URL is not part of CareerX. Pick a track or go home."
      action={
        <>
          <Button to="/">Go home</Button>
          <Button to="/tracks" variant="secondary">
            Browse tracks
          </Button>
        </>
      }
    />
  )
}
