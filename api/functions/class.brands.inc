<?php

class Brands {
    public $name;
    public $id;

    //stores results from database queries
    public $result;
    public $rows;

    //sets up the database connection
    private function setupDb(){
        include('config.inc');
    }

    public function getBrands() {
        $this->setupDb();
        $sql = $this->db->prepare("SELECT name, id_brand
                                FROM brands
                                ORDER BY name ASC");
        $sql->execute();
        $result = $sql->fetchAll(PDO::FETCH_ASSOC);
        $this->result = json_encode($result);
    }

    //query the database to retrieve user information
    public function addBrand(){
        //set up database
        $this->setupDb();
        $sql = $this->db->prepare("SELECT name
                            FROM brands
                            WHERE name = ?");
        $sql->bindParam(1, $this->name);
        $sql->execute();
        $this->rows = $sql->rowCount();
        if ($this->rows > 0):
            $this->result = 'The brand "' . $this->name . '" already exists.';
        else:
            $brands = $this->db->prepare(" INSERT INTO brands (name)
                                          VALUES (?)");

            $brands->bindParam(1, $this->name);
            $brands->execute();
            $this->result = 'success';  
        endif;
    }

    //add new user
    public function deleteBrand(){
        $this->setupDb();
        $sqlGet = $this->db->prepare("SELECT *
                                      FROM products
                                      WHERE id_brand = ?");
        $sqlGet->bindParam(1, $this->id);
        $sqlGet->execute();
        $rows = $sqlGet->rowCount();
        if ($rows > 0):
            $this->result = json_encode($sqlGet->fetch(PDO::FETCH_ASSOC));
        else:
            $sql = $this->db->prepare(" DELETE FROM brands 
                                    WHERE id_brand = ?");
            $sql->bindParam(1, $this->id);
            $sql->execute();

            $this->result = 'success';
        endif;
    }
}
