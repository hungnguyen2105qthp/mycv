import com.microsoft.sqlserver.jdbc.SQLServerDataSource;

import java.sql.Connection;
import java.sql.SQLException;

public class test {
    public static void main(String[] args) {
        SQLServerDataSource ds=new SQLServerDataSource();
        ds.setPassword("");
        ds.setServerName("HUNG/HUNG");
        ds.setPortNumber(1433);
        ds.setDatabaseName("TTCN");

        try (Connection conn=ds.getConnection()){
            System.out.println(conn.getMetaData());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
