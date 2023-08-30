import { Card, CardContent, CardMedia, Typography, Button, CardActions } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface courseType {
        _id?: String,
        title?: String,
        description?: String,
        price?: Number,
        imageLink?: String,
        published?: Boolean
}

function MyCreatedCourses() {
    const [myCourses, setMyCourses] = useState<courseType []>([]);

    useEffect(() => {
        axios.get('http://localhost:3000/admin/createdCourses', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then((res) => {
            const data = res.data;
            const courseIds = data.createdCourses;

            // Use Promise.all to fetch all courses
            const fetchPromises = courseIds.map((id: String) => {
                return axios.get('http://localhost:3000/admin/course/' + id, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
            });

            Promise.all(fetchPromises)
                .then((responses) => {
                    const fetchedCourses = responses.map(response => response.data.course);
                    setMyCourses(fetchedCourses);
                })
                .catch((error) => {
                    console.error('Error fetching courses:', error);
                });
        })
        .catch((error) => {
            console.error('Error fetching course IDs:', error);
        });
    }, []);

    if(myCourses.length === 0) {
        return <div>Loading....</div>
    }

    console.log(myCourses);

    return <div>
        <Typography variant="h4" style={{marginBottom: 20}} textAlign={'center'}>My Created Courses</Typography>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', height: '100%'}}>
            {myCourses.map((course) => {
                return <div style={{marginRight: 50}}>
                    <DisplayCourses course={course}/>
                </div>
            })}
        </div>
    </div>
}

function DisplayCourses({course} : {course : courseType}) {
    const navigate = useNavigate();
    return (
        <Card
            variant="outlined"
            style={{
                width: 300,
                height: '100%',
                borderRadius: 20,
                overflow: 'hidden', // Hide overflowing content
            }}
        >
            <CardMedia
                component="img"
                image={course.imageLink}
                alt={course.title}
                style={{
                    width: '100%',
                    objectFit: 'cover',
                    height: 150, // Adjust image height as needed
                }}
            />
            <CardContent style={{ paddingTop: 0, paddingBottom: 15 }}>
                <Typography variant="h5" align="center">
                    {course.title}
                </Typography>
                <Typography variant="subtitle1" align="center">
                    Rs {course.price?.toString()}
                </Typography>
                <Typography variant="subtitle1" align="center">
                    {course.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" style={{left:10}} onClick={() => {
                    navigate('/course/'+ course._id)
                }}>Edit</Button>
                <Button variant="contained" color="error" style={{left:10, marginLeft:10}} onClick={async() => {
                    const answer = prompt("To delete the course type 'delete' below");

                    if(answer === 'delete') {
                        const response = axios.delete('http://localhost:3000/admin/deletecourse/' + course._id, {
                            headers: {
                                Authorization: 'Bearer ' + localStorage.getItem('token')
                            }
                        });
                        response
                        window.location.href = '/owncourses'
                        alert('Course deleted!')
                    }
                }}>delete</Button>
            </CardActions>
        </Card>
    );
}

export default MyCreatedCourses;