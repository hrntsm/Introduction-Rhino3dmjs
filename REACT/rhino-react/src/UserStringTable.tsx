import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function BasicTable(prop: any) {
    return (
        <div>
            {prop.data ? prop.data.map((row: string[][], gIndex: number) => (
                <div>
                    <p>{"Geometry Index:" + gIndex}</p>
                    <TableContainer sx={{ width: 300 }} component={Paper}>
                        <Table  aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Index</TableCell>
                                    <TableCell align="right">Key</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.map((item: string[], index: number) => (
                                    <TableRow
                                        key="geometry"
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {index}
                                        </TableCell>
                                        <TableCell align="right">{item[0]}</TableCell>
                                        <TableCell align="right">{item[1]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>))
                : null}
        </div>
    );
}