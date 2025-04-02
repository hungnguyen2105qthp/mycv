import com.microsoft.sqlserver.jdbc.SQLServerDataSource;
import org.springframework.boot.autoconfigure.flyway.FlywayProperties;

import java.sql.Connection;
import java.sql.SQLException;

public class Data {
    public static void main(String[] args) {
        SQLServerDataSource ds= new SQLServerDataSource();
        ds.setUser("sa");
        ds.setPassword("123");
        ds.setServerName("hung\\HUNG");
        ds.setPortNumber(1433);
        ds.setDatabaseName("TTCN");

        try (Connection conn= ds.getConnection()){
            System.out.println(conn.getMetaData());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }
}
