import { Box } from "@mui/material"
import { useParams } from "react-router-dom";

const ProcessoPage = () => {
      const { id: processId } = useParams<{ id: string }>();


    return (
        <Box>{processId}</Box>
    )
}

export default ProcessoPage;