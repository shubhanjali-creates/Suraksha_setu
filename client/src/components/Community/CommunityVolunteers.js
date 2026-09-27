import React from 'react'

export const CommunityVolunteers = () => {
  return (
    <div>
      <h1>Here's the list of volunteers in this community:</h1>
      <table style={{display:'table'}}>
        <thead>
          <tr>
            <th>UserID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Availability</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>101</td><td>Rohan Verma</td><td>rohan.verma@example.in</td><td>9876543210</td><td>Raipur, Chhattisgarh</td><td>true</td></tr>
          <tr><td>102</td><td>Priya Patel</td><td>priya.patel@example.in</td><td>9812345678</td><td>Bhilai, Chhattisgarh</td><td>true</td></tr>
          <tr><td>103</td><td>Arjun Mehta</td><td>arjun.mehta@example.in</td><td>9123456780</td><td>Durg, Chhattisgarh</td><td>false</td></tr>
        </tbody>
      </table>
    </div>
  )
}
